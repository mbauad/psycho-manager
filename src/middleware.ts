import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isRegisterRoute = nextUrl.pathname === "/register";
  const isAlterarSenhaRoute = nextUrl.pathname === "/alterar-senha";
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const mustChangePassword = req.auth?.user?.mustChangePassword;

  if (isApiAuthRoute) return NextResponse.next();

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (mustChangePassword) {
        return NextResponse.redirect(new URL("/alterar-senha", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (mustChangePassword && !isAlterarSenhaRoute) {
    return NextResponse.redirect(new URL("/alterar-senha", nextUrl));
  }

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if ((isAdminRoute || isRegisterRoute) && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
