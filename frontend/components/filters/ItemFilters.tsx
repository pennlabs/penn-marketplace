"use client";

import { useState } from "react";
import { X, SlidersHorizontal, Search } from "lucide-react";
import { FilterBar } from "@/components/filters/FilterBar";
import { PriceRangeInput } from "@/components/filters/PriceRangeInput";
import { SearchInput } from "@/components/filters/SearchInput";
import { Select } from "@/components/filters/Select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS, ITEM_FILTER_KEYS } from "@/lib/constants";
import { ItemFilters as ItemFiltersType } from "@/lib/types";
import { useFilters } from "@/providers/FiltersProvider";

export const ItemFilters = () => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ItemFiltersType>(filters.items);

  const handleOpenModal = () => {
    setTempFilters(filters.items);
    setIsMobileModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMobileModalOpen(false);
  };

  const handleResetFilters = () => {
    resetFilters("items");
    setTempFilters(filters.items);
    setIsMobileModalOpen(false);
  };

  const handleMobileApplyFilters = () => {
    for (const key of ITEM_FILTER_KEYS) {
      updateFilter("items", key, tempFilters[key]);
    }
    setIsMobileModalOpen(false);
  };

  return (
    <>
      {/* desktop view */}
      <div className="hidden md:block">
        <FilterBar>
          <SearchInput
            placeholder="Search items..."
            value={filters.items.search}
            onChange={(value) => updateFilter("items", "search", value)}
          />
          <div className="flex items-center gap-3">
            <Select
              value={filters.items.category || ""}
              onValueChange={(value) => updateFilter("items", "category", value || undefined)}
              options={CATEGORY_OPTIONS}
              placeholder="All Categories"
            />
            <Select
              value={filters.items.condition || ""}
              onValueChange={(value) => updateFilter("items", "condition", value || undefined)}
              options={CONDITION_OPTIONS}
              placeholder="Any Condition"
            />
          </div>
          <PriceRangeInput
            minValue={filters.items.minPrice || ""}
            maxValue={filters.items.maxPrice || ""}
            onMinChange={(value) => updateFilter("items", "minPrice", value || undefined)}
            onMaxChange={(value) => updateFilter("items", "maxPrice", value || undefined)}
          />
        </FilterBar>
      </div>

      {/* mobile view */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-4 w-5 -translate-y-1/2 transform" />
          <Input
            type="text"
            placeholder="Search items..."
            value={filters.items.search}
            onChange={(e) => updateFilter("items", "search", e.target.value)}
            className="bg-background focus-visible:border-input h-10 w-full pl-11 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Button variant="outline" size="icon" onClick={handleOpenModal} aria-label="Open filters">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* mobile modal */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="animate-in fade-in absolute inset-0 bg-black/50"
            onClick={handleCloseModal}
          />

          <div className="animate-in slide-in-from-bottom absolute right-0 bottom-0 left-0 rounded-t-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={tempFilters.category || ""}
                    onValueChange={(value) =>
                      setTempFilters({ ...tempFilters, category: value || undefined })
                    }
                    options={CATEGORY_OPTIONS}
                    placeholder="All Categories"
                    triggerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Condition</label>
                  <Select
                    value={tempFilters.condition || ""}
                    onValueChange={(value) =>
                      setTempFilters({ ...tempFilters, condition: value || undefined })
                    }
                    options={CONDITION_OPTIONS}
                    placeholder="Any Condition"
                    triggerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price Range
                  </label>
                  <PriceRangeInput
                    minValue={tempFilters.minPrice || ""}
                    maxValue={tempFilters.maxPrice || ""}
                    onMinChange={(value) =>
                      setTempFilters({ ...tempFilters, minPrice: value || undefined })
                    }
                    onMaxChange={(value) =>
                      setTempFilters({ ...tempFilters, maxPrice: value || undefined })
                    }
                    inputClassName="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                Reset
              </Button>
              <Button className="flex-1" onClick={handleMobileApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
