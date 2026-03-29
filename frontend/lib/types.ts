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
  phone_number: string | null;
  phone_verified: boolean;
};

// ------------------------------------------------------------
// additional data types (from API)
// ------------------------------------------------------------
export type ItemCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";

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
  street_address: string;
  latitude: number;
  longitude: number;
  beds: number;
  baths: number;
  start_date: string;
  end_date: string;
};

// ------------------------------------------------------------
// address autocomplete types
// ------------------------------------------------------------

export type PhotonGeometry = {
  type: "Point";
  coordinates: [number, number]; // longitude, latitude
};

export type PhotonProperties = {
  osm_id: number;
  osm_type: string;
  osm_value: string;
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  extent?: [number, number, number];
  county?: string;
  district?: string;
  locality?: string;
};

export type PhotonFeature = {
  type: "Feature";
  geometry: PhotonGeometry;
  properties: PhotonProperties;
};

export type PhotonReponse = {
  type: "FeatureCollection";
  features: PhotonFeature[];
};

export type AddressResult = {
  placeId: number;
  lat: string;
  lon: string;
  displayName: string;
  address: {
    housenumber?: string;
    road?: string;
    city?: string;
    state?: string;
    postCode?: string;
    country?: string;
    countryCode?: string;
  };
};

export type ValidatedAddress = {
  displayName: string;
  lat: string;
  lon: string;
  placeId: number;
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
  is_favorited?: boolean;
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

export type OfferStatus = "pending" | "accepted" | "rejected";

export type Offer = {
  id: number;
  user: User;
  listing: number;
  offered_price: number;
  message: string | null;
  status: OfferStatus;
  created_at: string;
};

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
export type BaseCreatePayload = {
  title: string;
  description?: string;
  price: string;
};

export type CreateItemPayload = BaseCreatePayload & {
  listing_type: "item";
  additional_data: ItemAdditionalData;
};

export type CreateSubletPayload = BaseCreatePayload & {
  listing_type: "sublet";
  additional_data: SubletAdditionalData;
};

// ------------------------------------------------------------
// update payload types
// ------------------------------------------------------------
type BaseUpdatePayload = {
  title?: string;
  description?: string;
  price?: number;
  expires_at?: string;
};

export type UpdateItemPayload = BaseUpdatePayload & {
  listing_type: "item";
  additional_data?: Partial<ItemAdditionalData>;
};

export type UpdateSubletPayload = BaseUpdatePayload & {
  listing_type: "sublet";
  additional_data?: Partial<SubletAdditionalData>;
};

export type UpdateListingPayload = UpdateItemPayload | UpdateSubletPayload;
