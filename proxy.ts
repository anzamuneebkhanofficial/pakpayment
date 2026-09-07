import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect logged-in users away from auth pages (NOT home page — that is always public)
  const publicAuthRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
  if (publicAuthRoutes.includes(pathname)) {
    const sessionCookie = 
      req.cookies.get("better-auth.session_token") || 
      req.cookies.get("__Secure-better-auth.session_token");

    if (sessionCookie && sessionCookie.value) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = 
      req.cookies.get("better-auth.session_token") || 
      req.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie || !sessionCookie.value) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Protect /api/merchant routes
  if (pathname.startsWith("/api/merchant")) {
    const sessionCookie = 
      req.cookies.get("better-auth.session_token") || 
      req.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}


export default proxy;
