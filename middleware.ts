import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //  Proteção de rota ADMIN
  if (pathname.startsWith("/admin")) {
    //  Exemplo de leitura de cookie (futuro uso real)
    const sessionToken = req.cookies.get("better-auth.session-token");

    //  Sem sessão → bloqueia acesso
    if (!sessionToken) {
      const loginUrl = new URL("/authentication", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Aqui você pode futuramente validar role (admin)
    // ex: chamar API interna ou decodificar JWT
  }

  return NextResponse.next();
}

//
// ⚠️ REGRA CRÍTICA: nunca rodar middleware em /api/auth
//
export const config = {
  matcher: [
    "/admin/:path*", // ✅ roda apenas onde precisa
  ],
};
