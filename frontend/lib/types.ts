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
export type ItemCondition =
  | "NEW"
  | "LIKE_NEW"
  | "GOOD"
  | "FAIR";

export type ItemCategory =
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
  condition: ItemCondition;
  category: ItemCategory;
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
export type ListingTypes = "items" | "sublets";

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

// ------------------------------------------------------------
// listing data
// ------------------------------------------------------------
/**
 * map of listing type keys to their corresponding data
 * TODO: add new listing types here to extend the system
 */
export type ListingDataMap = {
  items: Item;
  sublets: Sublet;
};

// ------------------------------------------------------------
// filters
// ------------------------------------------------------------
export type ItemFilters = {
  search: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
};

export type SubletFilters = {
  numBeds?: string;
  numBaths?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
};

/**
 * map of listing types to their filter types
 * TODO: add new filter types here when extending the system
 */
export type ListingFiltersMap = {
  items: ItemFilters;
  sublets: SubletFilters;
};


// ------------------------------------------------------------
// create payload types
// ------------------------------------------------------------
type BaseCreatePayload = {
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  expires_at: string;
  external_link?: string;
  tags: string[];
}

export type CreateItemPayload = BaseCreatePayload & {
  listing_type: "item";
  additional_data: ItemAdditionalData;
}

export type CreateSubletPayload = BaseCreatePayload & {
  listing_type: "sublet";
  additional_data: SubletAdditionalData;
}
