import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

/*
 * The admin screen's sign-in.
 *
 * This gate only decides who sees the authorization screen. The authority itself
 * is on-chain: approving a garage is `onlyOwner`, so every change still needs the
 * registry owner's wallet to sign it. Someone who guesses the password gets a
 * form they cannot submit.
 *
 * Credentials default to admin / 0000 for the demo; set ADMIN_USERNAME and
 * ADMIN_PASSWORD on the host to change them.
 */

export const ADMIN_COOKIE = "cl_admin";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function credentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "0000",
  };
}

/**
 * The session token: an HMAC over the credentials, so changing the password
 * signs everyone out, and the cookie never contains the password itself.
 */
function sessionToken() {
  const { username, password } = credentials();
  const secret = process.env.ADMIN_SESSION_SECRET || "carlog-admin-session";
  return createHmac("sha256", secret).update(`${username}\n${password}`).digest("hex");
}

function sameText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkCredentials(username: string, password: string) {
  const expected = credentials();
  // Evaluate both, so a wrong username takes as long as a wrong password.
  const userOk = sameText(username, expected.username);
  const passOk = sameText(password, expected.password);
  return userOk && passOk;
}

export async function isAdmin() {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(value) && sameText(value!, sessionToken());
}

export async function startAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL,
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
