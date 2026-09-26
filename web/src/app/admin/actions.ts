"use server";

import { redirect } from "next/navigation";

import { checkCredentials, endAdminSession, startAdminSession } from "@/lib/admin-session";

export type LoginState = { failed: boolean } | null;

export async function signIn(_previous: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    // Slow down guessing a little; the real lock is the owner's wallet.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { failed: true };
  }

  await startAdminSession();
  redirect("/admin");
}

export async function signOut() {
  await endAdminSession();
  redirect("/admin");
}
