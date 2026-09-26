"use client";

import { PrivyProvider, usePrivy, useWallets, type ConnectedWallet } from "@privy-io/react-auth";
import { createSmartAccountClient, type SmartAccountClient } from "permissionless";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPublicClient, createWalletClient, custom, encodeFunctionData, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { useAccount, useSignMessage, useWriteContract } from "wagmi";

import { monadTestnet } from "@/lib/chain";
import { registry } from "@/lib/registry";

/*
 * Who the garage is, however it signed in.
 *
 * Two ways in, one interface out:
 * - "wallet": MetaMask, as before. The garage signs and pays gas itself.
 * - "phone":  a phone number or e-mail through Privy. Privy creates a wallet in
 *             the background, a Kernel smart account sits on top of it, and
 *             Pimlico's paymaster pays the gas. The garage never sees MON.
 *
 * The contract does not change: the smart account is simply the address that
 * gets approved as a garage and that earns the garage's share.
 */

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/** Plain chain reads for the smart-account path (simulation before sending). */
const readClient = createPublicClient({ chain: monadTestnet, transport: http() });
const BUNDLER_URL = process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL;

export type UstaMode = "wallet" | "phone";

type WriteArgs = {
  functionName: string;
  args: readonly unknown[];
  /** Called when the transaction leaves the garage's hands: time the network from here. */
  onSubmitted?: () => void;
};

type UstaSession = {
  mode: UstaMode | null;
  address: `0x${string}` | undefined;
  /** Signed in, on the right network, and able to write. */
  ready: boolean;
  /** Whether phone sign-in is configured on this deployment. */
  phoneAvailable: boolean;
  /** Phone sign-in is working on its smart account (between login and ready). */
  phonePreparing: boolean;
  /** The phone number or e-mail used to sign in, for display. */
  identity: string | null;
  loginWithPhone: () => void;
  logout: () => void;
  /** Sends a registry transaction and resolves with its hash once submitted. */
  write: (request: WriteArgs) => Promise<`0x${string}`>;
  signMessage: (message: string) => Promise<`0x${string}`>;
};

const Context = createContext<UstaSession | null>(null);

export function useUstaSession() {
  const session = useContext(Context);
  if (!session) throw new Error("useUstaSession must be used inside UstaSessionProvider");
  return session;
}

export function UstaSessionProvider({ children }: { children: ReactNode }) {
  if (!PRIVY_APP_ID || !BUNDLER_URL) return <WalletOnlySession>{children}</WalletOnlySession>;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // E-mail is on for every Privy app; SMS needs enabling in the Privy
        // dashboard (and is limited in some countries), so it is opt-in here.
        loginMethods: process.env.NEXT_PUBLIC_PRIVY_SMS === "true" ? ["sms", "email"] : ["email"],
        appearance: {
          accentColor: "#c8102e",
          showWalletLoginFirst: false,
          walletList: [],
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "all-users" },
          // No confirmation pop-ups: the garage tapped "save", that is the consent.
          showWalletUIs: false,
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      <PhoneAndWalletSession>{children}</PhoneAndWalletSession>
    </PrivyProvider>
  );
}

/** The MetaMask half, shared by both providers. */
function useWalletSide() {
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();

  const ready = isConnected && chainId === monadTestnet.id;

  const write = useCallback(
    async ({ functionName, args, onSubmitted }: WriteArgs) => {
      const hash = await writeContractAsync({
        ...registry,
        functionName,
        args,
      } as Parameters<typeof writeContractAsync>[0]);
      onSubmitted?.();
      return hash;
    },
    [writeContractAsync],
  );

  const signMessage = useCallback(
    (message: string) => signMessageAsync({ message }),
    [signMessageAsync],
  );

  return { address, ready, write, signMessage };
}

function WalletOnlySession({ children }: { children: ReactNode }) {
  const wallet = useWalletSide();

  const value = useMemo<UstaSession>(
    () => ({
      mode: wallet.address ? "wallet" : null,
      address: wallet.address,
      ready: wallet.ready,
      phoneAvailable: false,
      phonePreparing: false,
      identity: null,
      loginWithPhone: () => {},
      logout: () => {},
      write: wallet.write,
      signMessage: wallet.signMessage,
    }),
    [wallet.address, wallet.ready, wallet.write, wallet.signMessage],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function PhoneAndWalletSession({ children }: { children: ReactNode }) {
  const wallet = useWalletSide();
  const { ready: privyReady, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy");

  const smart = useSmartAccount(authenticated ? embedded : undefined);

  const phoneActive = authenticated && !!smart.client && !!smart.address;
  const identity = user?.phone?.number ?? user?.email?.address ?? null;

  const value = useMemo<UstaSession>(() => {
    if (phoneActive) {
      const client = smart.client!;
      return {
        mode: "phone",
        address: smart.address!,
        ready: true,
        phoneAvailable: true,
        phonePreparing: false,
        identity,
        loginWithPhone: login,
        logout: () => void logout(),
        write: async ({ functionName, args, onSubmitted }) => {
          // A smart account swallows a reverted inner call; ask the chain first so
          // a refusal (say, MileageRollback) surfaces as the error it is.
          await readClient.simulateContract({
            ...registry,
            functionName,
            args,
            account: smart.address!,
          } as Parameters<typeof readClient.simulateContract>[0]);
          const data = encodeFunctionData({
            abi: registry.abi,
            functionName,
            args,
          } as Parameters<typeof encodeFunctionData>[0]);
          // Nothing for the garage to confirm, so the clock starts now.
          onSubmitted?.();
          return client.sendTransaction({
            account: client.account!,
            chain: monadTestnet,
            to: registry.address,
            data,
          });
        },
        signMessage: (message) => client.signMessage({ account: client.account!, message }),
      };
    }

    return {
      mode: wallet.address ? "wallet" : null,
      address: wallet.address,
      ready: wallet.ready,
      phoneAvailable: privyReady,
      phonePreparing: authenticated && !phoneActive,
      identity: null,
      loginWithPhone: login,
      logout: () => void logout(),
      write: wallet.write,
      signMessage: wallet.signMessage,
    };
  }, [phoneActive, smart.client, smart.address, identity, login, logout, wallet, privyReady, authenticated]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** A Kernel smart account over Privy's embedded wallet, with Pimlico paying gas. */
function useSmartAccount(embedded: ConnectedWallet | undefined) {
  const [state, setState] = useState<{
    owner: string;
    client: SmartAccountClient;
    address: `0x${string}`;
  } | null>(null);

  useEffect(() => {
    if (!embedded) return;
    let cancelled = false;

    (async () => {
      const provider = await embedded.getEthereumProvider();
      const owner = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: monadTestnet,
        transport: custom(provider),
      });
      const account = await toKernelSmartAccount({
        client: readClient,
        entryPoint: { address: entryPoint07Address, version: "0.7" },
        owners: [owner],
        version: "0.3.1",
      });

      const pimlico = createPimlicoClient({
        transport: http(BUNDLER_URL),
        entryPoint: { address: entryPoint07Address, version: "0.7" },
      });

      const client = createSmartAccountClient({
        account,
        chain: monadTestnet,
        bundlerTransport: http(BUNDLER_URL),
        paymaster: pimlico,
        userOperation: {
          estimateFeesPerGas: async () => (await pimlico.getUserOperationGasPrice()).fast,
        },
      });

      if (!cancelled) {
        setState({ owner: embedded.address, client: client as SmartAccountClient, address: account.address });
      }
    })().catch((error) => console.error("smart account setup failed", error));

    return () => {
      cancelled = true;
    };
  }, [embedded]);

  // A stale account from a previous sign-in never answers for the current one.
  const current = state && embedded && state.owner === embedded.address ? state : null;
  return { client: current?.client ?? null, address: current?.address ?? null };
}

/**
 * One registry transaction's lifecycle, the same for both sign-in paths:
 * pending (waiting on the garage) -> confirming (on the network) -> success.
 * confirmMs times the network only, from submission to receipt.
 */
export function useRegistryWrite() {
  const session = useUstaSession();
  const [status, setStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">(
    "idle",
  );
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [confirmMs, setConfirmMs] = useState<number | null>(null);

  const write = useCallback(
    async (functionName: string, args: readonly unknown[]) => {
      setStatus("pending");
      setError(null);
      setHash(undefined);
      setConfirmMs(null);
      let startedAt = Date.now();
      try {
        const submitted = await session.write({
          functionName,
          args,
          onSubmitted: () => {
            startedAt = Date.now();
            setStatus("confirming");
          },
        });
        setHash(submitted);
        const receipt = await readClient.waitForTransactionReceipt({ hash: submitted });
        if (receipt.status !== "success") throw new Error("Transaction reverted");
        setConfirmMs(Date.now() - startedAt);
        setStatus("success");
      } catch (caught) {
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setStatus("error");
      }
    },
    [session],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setHash(undefined);
    setConfirmMs(null);
  }, []);

  return {
    write,
    reset,
    hash,
    error,
    confirmMs,
    isPending: status === "pending",
    isConfirming: status === "confirming",
    isSuccess: status === "success",
  };
}
