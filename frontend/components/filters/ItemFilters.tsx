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
      <div className="md:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-4 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search items..."
            value={filters.items.search}
            onChange={(e) => updateFilter("items", "search", e.target.value)}
            className="pl-11 h-10 w-full text-sm bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleOpenModal}
          aria-label="Open filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* mobile modal */}
      {isMobileModalOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in"
            onClick={handleCloseModal}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select
                    value={tempFilters.category || ""}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, category: value || undefined })}
                    options={CATEGORY_OPTIONS}
                    placeholder="All Categories"
                    triggerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
                  <Select
                    value={tempFilters.condition || ""}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, condition: value || undefined })}
                    options={CONDITION_OPTIONS}
                    placeholder="Any Condition"
                    triggerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                  <PriceRangeInput
                    minValue={tempFilters.minPrice || ""}
                    maxValue={tempFilters.maxPrice || ""}
                    onMinChange={(value) => setTempFilters({ ...tempFilters, minPrice: value || undefined })}
                    onMaxChange={(value) => setTempFilters({ ...tempFilters, maxPrice: value || undefined })}
                    inputClassName="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
              <Button
                className="flex-1"
                onClick={handleMobileApplyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};