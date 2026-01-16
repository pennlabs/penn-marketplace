import {
  ItemCategory,
  ItemCondition,
  ItemFilters,
  ListingFiltersMap,
  SubletFilters,
} from "@/lib/types";

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "REPLACE WITH PROD BASE URL"
    : "http://localhost:3000";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "REPLACE WITH PROD API URL"
    : "http://localhost:8000";

export const PLATFORM_URL = process.env.PLATFORM_URL;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;

export const OIDC_REDIRECT_URI = `${BASE_URL}/callback`; // TODO: needs to be /api/callback not /callback
export const OIDC_AUTHORIZATION_ENDPOINT = `${PLATFORM_URL}/accounts/authorize/`;
export const OIDC_TOKEN_ENDPOINT = `${API_BASE_URL}/accounts/token/`;

export const COOKIE_OPTIONS: {
  httpOnly: boolean;
  secure: boolean;
} = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export const ITEM_FILTER_KEYS: Array<keyof ItemFilters> = [
  "category",
  "condition",
  "minPrice",
  "maxPrice",
];

export const SUBLET_FILTER_KEYS: Array<keyof SubletFilters> = [
  "numBeds",
  "numBaths",
  "startDate",
  "endDate",
  "minPrice",
  "maxPrice",
];

export const CATEGORY_OPTIONS: Array<{ value: ItemCategory; label: string }> = [
  { value: "Art", label: "Art" },
  { value: "Books", label: "Books" },
  { value: "Clothing", label: "Clothing" },
  { value: "Electronics", label: "Electronics" },
  { value: "Furniture", label: "Furniture" },
  { value: "Home and Garden", label: "Home and Garden" },
  { value: "Music", label: "Music" },
  { value: "Other", label: "Other" },
  { value: "Tools", label: "Tools" },
  { value: "Vehicles", label: "Vehicles" },
];

export const CONDITION_OPTIONS: Array<{ value: ItemCondition; label: string }> =
  [
    { value: "NEW", label: "New" },
    { value: "LIKE_NEW", label: "Used - Like New" },
    { value: "GOOD", label: "Used - Good" },
    { value: "FAIR", label: "Used - Fair" },
  ];

export const BEDS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "1", label: "1 Bed" },
  { value: "2", label: "2 Beds" },
  { value: "3", label: "3 Beds" },
  { value: "4", label: "4 Beds" },
  { value: "5", label: "5+ Beds" },
];

export const BATHS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "1", label: "1 Bath" },
  { value: "2", label: "2 Baths" },
  { value: "3", label: "3 Baths" },
  { value: "4", label: "4+ Baths" },
];

export const DEFAULT_FILTERS: ListingFiltersMap = {
  items: {
    search: "",
  },
  sublets: {},
} as const;
