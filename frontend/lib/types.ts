// ------------------------------------------------------------
// auth
// ------------------------------------------------------------
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  idToken: string;
};

export type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
};

// ------------------------------------------------------------
// additional data types (from API)
// ------------------------------------------------------------
export type ListingCondition =
  | "New"
  | "Used - Like New"
  | "Used - Good"
  | "Used - Fair";

export type ListingCategory =
  | "Art"
  | "Books"
  | "Clothing"
  | "Electronics"
  | "Furniture"
  | "Home and Garden"
  | "Music"
  | "Other"
  | "Tools"
  | "Vehicles";

export type ItemAdditionalData = {
  condition: ListingCondition;
  category: ListingCategory;
};

export type SubletAdditionalData = {
  address: string;
  beds: number;
  baths: number;
  start_date: string;
  end_date: string;
};

// ------------------------------------------------------------
// base listing fields (shared by all listings)
// ------------------------------------------------------------
type BaseListing = {
  id: number;
  title: string;
  description: string;
  external_link: string;
  price: number;
  negotiable: boolean;
  created_at: string;
  expires_at: string;
  images: string[];
  tags: string[];
  favorite_count: number;
  seller: User;
};

// ------------------------------------------------------------
// item
// ------------------------------------------------------------
export type Item = BaseListing & {
  listing_type: "item";
  additional_data: ItemAdditionalData;
};

// ------------------------------------------------------------
// sublet
// ------------------------------------------------------------
export type Sublet = BaseListing & {
  listing_type: "sublet";
  additional_data: SubletAdditionalData;
};

// ------------------------------------------------------------
// base listings (discriminated union)
// ------------------------------------------------------------
export type Listing = Item | Sublet;

// ------------------------------------------------------------
// api responses
// ------------------------------------------------------------
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  offset: number;
  results: T[];
};
