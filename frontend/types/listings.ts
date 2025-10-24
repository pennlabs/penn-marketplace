export type Listings = {
  id: number;
  title: string;
};

export enum ListingCondition {
  NEW = "New",
  USED_LIKE_NEW = "Used - Like New",
  USED_GOOD = "Used - Good",
  USED_FAIR = "Used - Fair",
}

export enum ListingCategory {
  ART = "Art",
  BOOKS = "Books",
  CLOTHING = "Clothing",
  ELECTRONICS = "Electronics",
  FURNITURE = "Furniture",
  HOME_AND_GARDEN = "Home and Garden",
  MUSIC = "Music",
  OTHER = "Other",
  TOOLS = "Tools",
  VEHICLES = "Vehicles",
}