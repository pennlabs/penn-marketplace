"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { ItemFilters, ListingTypes, ListingFiltersMap, SubletFilters } from "@/lib/types";

type FilterSetters = {
  [K in ListingTypes]: React.Dispatch<React.SetStateAction<ListingFiltersMap[K]>>;
};

interface FiltersContextType {
  filters: ListingFiltersMap;
  debouncedFilters: ListingFiltersMap;
  updateFilter: <T extends ListingTypes, K extends keyof ListingFiltersMap[T]>(
    type: T,
    key: K,
    value: ListingFiltersMap[T][K]
  ) => void;
  resetFilters: <T extends ListingTypes>(type: T) => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export default function FiltersProvider({ children }: { children: ReactNode }) {
  const [itemFilters, setItemFilters] = useState<ItemFilters>(DEFAULT_FILTERS.items);
  const [subletFilters, setSubletFilters] = useState<SubletFilters>(DEFAULT_FILTERS.sublets);
  const [debouncedItemFilters, setDebouncedItemFilters] = useState<ItemFilters>(DEFAULT_FILTERS.items);
  const [debouncedSubletFilters, setDebouncedSubletFilters] = useState<SubletFilters>(DEFAULT_FILTERS.sublets);

  const settersMap: FilterSetters = useMemo(() => ({
    items: setItemFilters,
    sublets: setSubletFilters,
  }), []);

  const updateFilter = <T extends ListingTypes, K extends keyof ListingFiltersMap[T]>(
    type: T,
    key: K,
    value: ListingFiltersMap[T][K]
  ) => {
    const setter = settersMap[type];
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = <T extends ListingTypes>(type: T) => {
    const setter = settersMap[type];
    setter(DEFAULT_FILTERS[type]);
  };

  const filters = useMemo<ListingFiltersMap>(() => ({
    items: itemFilters,
    sublets: subletFilters,
  }), [itemFilters, subletFilters]);

  const debouncedFilters = useMemo<ListingFiltersMap>(() => ({
    items: debouncedItemFilters,
    sublets: debouncedSubletFilters,
  }), [debouncedItemFilters, debouncedSubletFilters]);

  // debounce item filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedItemFilters(itemFilters);
    }, 500);
    return () => clearTimeout(handler);
  }, [itemFilters]);

  // debounce sublet filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSubletFilters(subletFilters);
    }, 500);
    return () => clearTimeout(handler);
  }, [subletFilters]);

  return (
    <FiltersContext.Provider
      value={{
        filters,
        debouncedFilters,
        updateFilter,
        resetFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}