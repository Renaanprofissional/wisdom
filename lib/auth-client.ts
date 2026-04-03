// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTERAUTH_URL, // URL completa do servidor BetterAuth
});

export const { signIn, signOut, useSession, getSession } = authClient;
