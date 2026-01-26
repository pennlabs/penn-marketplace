import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  OIDC_REDIRECT_URI,
  COOKIE_OPTIONS,
  OIDC_TOKEN_ENDPOINT,
} from "@/lib/constants";
import { ErrorResponses } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return ErrorResponses.noAuthorizationCode();
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return ErrorResponses.serverConfiguration();
    }

    const res = await fetch(`${OIDC_TOKEN_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: OIDC_REDIRECT_URI,
        code,
      }),
    });

    if (!res.ok) {
      return ErrorResponses.tokenExchangeFailed();
    }

    const { id_token, access_token, refresh_token, expires_in } = await res.json();
    const redirectUrl = state || "/";
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    response.cookies.set("id_token", id_token, {
      ...COOKIE_OPTIONS,
      maxAge: expires_in,
    });

    response.cookies.set("access_token", access_token, {
      ...COOKIE_OPTIONS,
      maxAge: expires_in,
    });

    response.cookies.set("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    const expiryTimeMs = Date.now() + expires_in * 1000;
    response.cookies.set("expires_in", expiryTimeMs.toString(), {
      ...COOKIE_OPTIONS,
      maxAge: expires_in,
    });

    return response;
  } catch {
    return ErrorResponses.internalServer();
  }
}
