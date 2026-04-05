import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // você pode validar cookie/session aqui depois
    // ou redirecionar direto
  }

  return NextResponse.next();
}
