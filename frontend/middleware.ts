import { NextRequest, NextResponse } from "next/server";
import { getLoginUrl } from "@/lib/auth";
import { CLIENT_ID, CLIENT_SECRET, OIDC_TOKEN_ENDPOINT, COOKIE_OPTIONS } from "@/lib/constants";
import { ErrorResponses } from "@/lib/errors";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const expiresIn = request.cookies.get("expires_in")?.value;

  // if no access token, redirect to login
  if (!accessToken) {
    try {
      const loginUrl = getLoginUrl(pathname);
      return NextResponse.redirect(loginUrl);
    } catch {
      return ErrorResponses.missingClientId();
    }
  }

  // check if token expired (with 5 min buffer)
  const isExpired = expiresIn && Date.now() >= parseInt(expiresIn) - 5 * 60 * 1000;

  // refresh token if expired
  if (isExpired && refreshToken) {
    try {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        return ErrorResponses.missingClientCredentials();
      }

      const res = await fetch(OIDC_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: refreshToken,
          scope: "openid read introspection",
        }),
      });

      if (res.ok) {
        const { access_token, refresh_token, expires_in } = await res.json();

        const response = NextResponse.next();

        response.cookies.set("access_token", access_token, {
          ...COOKIE_OPTIONS,
          maxAge: expires_in,
        });

        response.cookies.set("refresh_token", refresh_token, {
          ...COOKIE_OPTIONS,
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        const newExpiryTimeMs = Date.now() + expires_in * 1000;
        response.cookies.set("expires_in", newExpiryTimeMs.toString(), {
          ...COOKIE_OPTIONS,
          maxAge: expires_in,
        });

        return response;
      } else {
        // refresh failed, redirect to login
        const loginUrl = getLoginUrl(pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      return ErrorResponses.internalServer();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/items", "/items/:path*", "/sublets", "/sublets/:path*"],
};
