"use server";

import { cookies } from "next/headers";
import { FETCH_LISTINGS_LIMIT } from "@/constants/listings";
import { API_BASE_URL } from "@/lib/constants";
import { APIError, ErrorMessages } from "@/lib/errors";
import { AuthTokens, Item, PaginatedResponse, Sublet, User } from "@/lib/types";

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
    const errorData = await response.json().catch(() => null);
    let errorMessage = `${ErrorMessages.API_REQUEST_FAILED}: ${response.status}`;

    if (errorData) {
      const firstKey = Object.keys(errorData)[0];
      if (firstKey) {
        const firstError = errorData[firstKey];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }
    }

    throw new APIError(errorMessage, response.status);
  }

  return response.json();
}

// ------------------------------------------------------------
// user
// ------------------------------------------------------------
export async function getCurrentUser(): Promise<User> {
  return await serverFetch<User>("/market/user/me/");
}

// ------------------------------------------------------------
// items
// ------------------------------------------------------------
export async function getItems({
  pageParam = 1,
  search = "",
  category,
  condition,
  minPrice,
  maxPrice,
}: {
  pageParam?: unknown;
  search?: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const page = typeof pageParam === "number" ? pageParam : 1;
  const offset = (page - 1) * FETCH_LISTINGS_LIMIT;

  const params = new URLSearchParams();
  params.append("type", "item");
  params.append("limit", FETCH_LISTINGS_LIMIT.toString());
  params.append("offset", offset.toString());

  if (search.trim()) params.append("title", search.trim());
  if (category) params.append("category", category);
  if (condition) params.append("condition", condition);
  if (minPrice !== undefined) params.append("min_price", minPrice.toString());
  if (maxPrice !== undefined) params.append("max_price", maxPrice.toString());

  return await serverFetch<PaginatedResponse<Item>>(
    `/market/listings/?${params.toString()}`
  );
}

// ------------------------------------------------------------
// sublets
// ------------------------------------------------------------
export async function getSublets({
  pageParam = 1,
  numBeds,
  numBaths,
  startDate,
  endDate,
  minPrice,
  maxPrice,
}: {
  pageParam?: unknown;
  numBeds?: string;
  numBaths?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const page = typeof pageParam === "number" ? pageParam : 1;
  const offset = (page - 1) * FETCH_LISTINGS_LIMIT;

  const params = new URLSearchParams();
  params.append("type", "sublet");
  params.append("limit", FETCH_LISTINGS_LIMIT.toString());
  params.append("offset", offset.toString());

  if (numBeds !== undefined) params.append("beds", numBeds.toString());
  if (numBaths !== undefined) params.append("baths", numBaths.toString());
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (minPrice !== undefined) params.append("min_price", minPrice.toString());
  if (maxPrice !== undefined) params.append("max_price", maxPrice.toString());

  return await serverFetch<PaginatedResponse<Sublet>>(
    `/market/listings/?${params.toString()}`
  );
}

// ------------------------------------------------------------
// single listing (items or sublets)
// ------------------------------------------------------------
export async function getListing(id: string) {
  return await serverFetch<Item | Sublet>(`/market/listings/${id}/`);
}

// ------------------------------------------------------------
// offers
// ------------------------------------------------------------
export async function createOffer({
  listingId,
  offeredPrice,
  message,
}: {
  listingId: number;
  offeredPrice: number;
  message?: string;
}) {
  const offer = await serverFetch(`/market/listings/${listingId}/offers/`, {
    method: "POST",
    body: JSON.stringify({
      offered_price: offeredPrice,
      message,
    }),
  });

  return offer;
}

export async function getPhoneStatus() {
  return await serverFetch<{
    phone_number: string | null;
    phone_verified: boolean;
    phone_verified_at: string | null;
  }>("/market/phone/status/");
}

export async function sendVerificationCode(phoneNumber: string) {
  return await serverFetch<{ success: boolean; phone_number: string }>(
    "/market/phone/send-code/",
    {
      method: "POST",
      body: JSON.stringify({ phone_number: phoneNumber }),
    }
  );
}

export async function verifyPhoneCode(phoneNumber: string, code: string) {
  return await serverFetch<{
    verified: boolean;
    phone_number: string;
  }>("/market/phone/verify-code/", {
    method: "POST",
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });
}



// ------------------------------------------------------------
// creating new listings
// ------------------------------------------------------------

type CreateItemPayload = {
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  expires_at: string;
  external_link?: string;
  tags: string[];
  listing_type: "item";
  additional_data: {
    condition: string;
    category: string;
  };
};

type CreateSubletPayload = {
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  expires_at: string;
  externalLink?: string;
  tags: string[];
  listing_type: "sublet";
  additional_data: {
    address: string;
    beds: number;
    baths: number;
    start_date: string;
    end_date: string;
  };
};

export type CreateListingPayload = CreateItemPayload | CreateSubletPayload;

export async function createListing(payload: CreateListingPayload): Promise<Listing> {
  return await serverFetch<Listing>("/market/listings/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}