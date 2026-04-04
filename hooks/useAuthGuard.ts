// /hooks/useAuthGuard.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useAuthGuard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/authentication");
    }
  }, [isPending, session, router]);

  return { session, isPending };
}