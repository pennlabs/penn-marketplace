import { getTokensFromCookies } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/constants";
import { APIError, ErrorMessages } from "@/lib/errors";

async function fetchWithCredentials<T>(
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

// HTTP method helpers
export const get = <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> =>
  fetchWithCredentials<T>(endpoint, { ...options, method: "GET" });

export const post = <T>(
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> =>
  fetchWithCredentials<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });

export const put = <T>(
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> =>
  fetchWithCredentials<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });

export const del = <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> =>
  fetchWithCredentials<T>(endpoint, { ...options, method: "DELETE" });

// marketplace API methods
export const marketplaceAPI = {
  // items
  getItems: () => get("/market/items/"),
  getItem: (id: string) => get(`/market/items/${id}/`),
  createItem: (data: any) => post("/market/items/", data),
  updateItem: (id: string, data: any) => put(`/market/items/${id}/`, data),
  deleteItem: (id: string) => del(`/market/items/${id}/`),

  // sublets
  getSublets: () => get("/market/sublets/"),
  getSublet: (id: string) => get(`/market/sublets/${id}/`),
  createSublet: (data: any) => post("/market/sublets/", data),
  updateSublet: (id: string, data: any) => put(`/market/sublets/${id}/`, data),
  deleteSublet: (id: string) => del(`/market/sublets/${id}/`),

  // categories and tags
  getCategories: () => get("/market/categories/"),
  getTags: () => get("/market/tags/"),

  // favorites
  getFavorites: () => get("/market/favorites/"),
  addFavorite: (itemId: string) => post(`/market/items/${itemId}/favorites/`),
  removeFavorite: (itemId: string) => del(`/market/items/${itemId}/favorites/`),

  // offers
  getOffers: (itemId: string) => get(`/market/items/${itemId}/offers/`),
  createOffer: (itemId: string, data: any) =>
    post(`/market/items/${itemId}/offers/`, data),
  deleteOffer: (itemId: string) => del(`/market/items/${itemId}/offers/`),
  getOffersMade: () => get("/market/offers/made/"),
  getOffersReceived: () => get("/market/offers/received/"),
};
