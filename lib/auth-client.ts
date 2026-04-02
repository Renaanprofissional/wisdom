"use client";

import { createAuthClient } from "better-auth/react";

// Cria o cliente de autenticação
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
