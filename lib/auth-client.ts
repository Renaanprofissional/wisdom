import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTERAUTH_URL,
});

export const { signIn, signOut, useSession, getSession } = authClient;
