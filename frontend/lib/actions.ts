"use server";

import { cookies } from "next/headers";
import { FETCH_LISTINGS_LIMIT } from "@/constants/listings";
import { API_BASE_URL } from "@/lib/constants";
import { APIError, ErrorMessages } from "@/lib/errors";
import { AuthTokens, Item, PaginatedResponse, Sublets } from "@/lib/types";

async function getTokensFromCookies(): Promise<AuthTokens | null> {
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

// base fetch function for server actions
async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const tokens = await getTokensFromCookies();
  const accessToken = tokens?.accessToken;

  if (!accessToken) {
    throw new APIError(ErrorMessages.NO_ACCESS_TOKEN, 401);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new APIError(
      `${ErrorMessages.API_REQUEST_FAILED}: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

// ------------------------------------------------------------
// items
// ------------------------------------------------------------
export async function getItems({ pageParam = 0 }: { pageParam: unknown }) {
  const offset = typeof pageParam === 'number' ? pageParam : 0;
  return await serverFetch<PaginatedResponse<Item>>(
    `/market/listings/?type=item&limit=${FETCH_LISTINGS_LIMIT}&offset=${offset}`
  );
}

// ------------------------------------------------------------
// sublets
// ------------------------------------------------------------
export async function getSublets({ pageParam = 0 }: { pageParam: unknown }) {
  const offset = typeof pageParam === 'number' ? pageParam : 0;
  return await serverFetch<PaginatedResponse<Sublets>>(
    `/market/listings/?type=sublet&limit=${FETCH_LISTINGS_LIMIT}&offset=${offset}`
  );
}
