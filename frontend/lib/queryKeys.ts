import { DEFAULT_FILTERS } from "@/lib/constants";
import { ListingFiltersMap, ListingTypes } from "@/lib/types";

export const queryKeys = {
  listings: <T extends ListingTypes>(type: T, filters?: ListingFiltersMap[T]) => [
    type,
    "list",
    filters ?? DEFAULT_FILTERS[type],
  ],
  listing: (id: number | string) => ["listing", String(id)],
};
