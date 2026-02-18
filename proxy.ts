import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const redirectPath = request.nextUrl.pathname + request.nextUrl.search;

    const params = new URLSearchParams({ redirect: redirectPath });

    const url = request.nextUrl.clone();

    url.pathname = "/auth/sign-in";
    url.search = params.toString();

    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!auth|_next|api|favicon.ico).*)"],
};
