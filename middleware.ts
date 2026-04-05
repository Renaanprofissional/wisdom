import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    try {
      // 🔥 chama seu próprio backend pra validar sessão
      const res = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      const data = await res.json();

      // 🚫 sem sessão válida
      if (!data?.session) {
        const loginUrl = new URL("/authentication", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      const loginUrl = new URL("/authentication", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
