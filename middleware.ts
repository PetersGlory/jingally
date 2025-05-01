import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { type NextRequestWithAuth, withAuth } from "next-auth/middleware"

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`, req.url),
      )
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
