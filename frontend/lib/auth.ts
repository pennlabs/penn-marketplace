import { cookies } from "next/headers";
import { CLIENT_ID, OIDC_AUTHORIZATION_ENDPOINT, OIDC_REDIRECT_URI } from "@/lib/constants";
import { ErrorMessages } from "@/lib/errors";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  idToken: string;
}

export function getLoginUrl(state: string): URL {
  if (!CLIENT_ID) {
    throw new Error(ErrorMessages.MISSING_CLIENT_ID);
  }

  const loginUrl = new URL(OIDC_AUTHORIZATION_ENDPOINT);
  loginUrl.searchParams.set("client_id", CLIENT_ID);
  loginUrl.searchParams.set("redirect_uri", OIDC_REDIRECT_URI);
  loginUrl.searchParams.set("response_type", "code");
  loginUrl.searchParams.set("scope", "openid read introspection");
  loginUrl.searchParams.set("state", state);

  return loginUrl;
}

export async function getTokensFromCookies(): Promise<AuthTokens | null> {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get("id_token")?.value;
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const expiresIn = cookieStore.get("expires_in")?.value;

    if (!idToken || !accessToken || !refreshToken || !expiresIn) {
      return null;
    }

    return {
      idToken,
      accessToken,
      refreshToken,
      expiresIn: parseInt(expiresIn),
    };
  } catch {
    return null;
  }
}
