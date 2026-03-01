"use server";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { FETCH_LISTINGS_LIMIT } from "@/constants/listings";
import { clearAuthCookies, getTokensFromCookies } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";
import { APIError, ErrorMessages } from "@/lib/errors";
import {
  AuthTokens,
  CreateItemPayload,
  CreateSubletPayload,
  Item,
  Listing,
  Offer,
  PaginatedResponse,
  Sublet,
  User,
} from "@/lib/types";

function formatFieldName(key: string): string {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

// recursively find the first leaf error string from a nested error object.
// handles: { title: ["Required"] }, { additional_data: { condition: "Required" } }, etc.
function parseFirstFieldError(obj: Record<string, unknown>): string {
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === "string") {
      return `${formatFieldName(key)}: ${value}`;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return `${formatFieldName(key)}: ${value[0]}`;
    }

    if (typeof value === "object" && value !== null) {
      return parseFirstFieldError(value as Record<string, unknown>);
    }
  }

  return `${ErrorMessages.API_REQUEST_FAILED}`;
}

async function safeFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  }
}

// base fetch function for server actions
async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const tokens = await getTokensFromCookies();
  const accessToken = tokens?.accessToken;

  if (!accessToken) {
    await clearAuthCookies();
    redirect("/");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    ...(options.headers as Record<string, string>),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await safeFetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      await clearAuthCookies();
      redirect("/");
    }

    // 5xx: server error - don't bother parsing body, sanitize in prod
    if (response.status >= 500) {
      const message =
        process.env.NODE_ENV === "production"
          ? "Something went wrong. Please try again."
          : `Server error: ${response.status}`;
      throw new APIError(message, response.status);
    }

    // 4xx: client error - parse field-level errors from response body
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData
      ? parseFirstFieldError(errorData)
      : `${ErrorMessages.API_REQUEST_FAILED}: ${response.status}`;

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

  return await serverFetch<PaginatedResponse<Item>>(`/market/listings/?${params.toString()}`);
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

  return await serverFetch<PaginatedResponse<Sublet>>(`/market/listings/?${params.toString()}`);
}

// ------------------------------------------------------------
// single listing (items or sublets)
// ------------------------------------------------------------
export async function getListing(id: string) {
  return await serverFetch<Item | Sublet>(`/market/listings/${id}/`);
}

export async function getListingOrNotFound(id: string) {
  try {
    return await getListing(id);
  } catch (error) {
    if (error instanceof APIError && error.status === 404) notFound();
    throw error;
  }
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
  return await serverFetch(`/market/listings/${listingId}/offers/`, {
    method: "POST",
    body: JSON.stringify({
      offered_price: offeredPrice,
      message,
    }),
  });
}

export async function getOffersMade() {
  return await serverFetch<PaginatedResponse<Offer>>("/market/offers/made/");
}

export async function getOffersReceived() {
  return await serverFetch<PaginatedResponse<Offer>>("/market/offers/received/");
}

export async function acceptOffer(offerId: number) {
  return await serverFetch<Offer>(`/market/offers/${offerId}/accept/`, {
    method: "POST",
  });
}

export async function rejectOffer(offerId: number) {
  return await serverFetch<Offer>(`/market/offers/${offerId}/reject/`, {
    method: "POST",
  });
}

export async function getPhoneStatus() {
  return await serverFetch<{
    phone_number: string | null;
    phone_verified: boolean;
    phone_verified_at: string | null;
  }>("/market/phone/status/");
}

export async function sendVerificationCode(phoneNumber: string) {
  return await serverFetch<{ success: boolean; phone_number: string }>("/market/phone/send-code/", {
    method: "POST",
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
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
// adding and removing listings from favorites
// ------------------------------------------------------------
export async function addToUsersFavorites(listingId: number) {
  return await serverFetch<void>(`/market/listings/${listingId}/favorites/`, {
    method: "POST",
  });
}
export async function deleteFromUsersFavorites(listingId: number) {
  return await serverFetch<void>(`/market/listings/${listingId}/favorites/`, {
    method: "DELETE",
  });
}

export async function getUsersFavorites() {
  return await serverFetch<PaginatedResponse<Item | Sublet>>("/market/favorites/");
}

// ------------------------------------------------------------
// creating new listings
// ------------------------------------------------------------
export type CreateListingPayload = CreateItemPayload | CreateSubletPayload;

export async function createListing(payload: CreateListingPayload): Promise<Listing> {
  return await serverFetch<Listing>("/market/listings/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateListingPayload = {
  title?: string;
  description?: string;
  price?: number;
  expires_at?: string;
  listing_type: "item" | "sublet";
  additional_data?: Record<string, unknown>;
};

export async function updateListing(
  listingId: number,
  payload: UpdateListingPayload
): Promise<Listing> {
  return await serverFetch<Listing>(`/market/listings/${listingId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteListing(listingId: number): Promise<void> {
  await serverFetch<void>(`/market/listings/${listingId}/`, {
    method: "DELETE",
  });
}
