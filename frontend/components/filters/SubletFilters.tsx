"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { FilterBar } from "@/components/filters/FilterBar";
import { PriceRangeInput } from "@/components/filters/PriceRangeInput";
import { DatePicker } from "@/components/filters/DatePicker";
import { Select } from "@/components/filters/Select";
import { Button } from "@/components/ui/button";
import { BATHS_OPTIONS, BEDS_OPTIONS, SUBLET_FILTER_KEYS } from "@/lib/constants";
import { SubletFilters as SubletFiltersType } from "@/lib/types";
import { useFilters } from "@/providers/FiltersProvider";

export const SubletFilters = () => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<SubletFiltersType>(filters.sublets);

  const handleOpenModal = () => {
    setTempFilters(filters.sublets);
    setIsMobileModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMobileModalOpen(false);
  };

  const handleResetFilters = () => {
    resetFilters("sublets");
    setTempFilters(filters.sublets);
    setIsMobileModalOpen(false);
  };

  const handleMobileApplyFilters = () => {
    for (const key of SUBLET_FILTER_KEYS) {
      updateFilter("sublets", key, tempFilters[key]);
    }
    setIsMobileModalOpen(false);
  };

  const toDateString = (date: Date | undefined) => date ? date.toISOString().split('T')[0] : undefined;

  const startDate = filters.sublets.startDate ? new Date(filters.sublets.startDate) : undefined;
  const endDate = filters.sublets.endDate ? new Date(filters.sublets.endDate) : undefined;
  const tempStartDate = tempFilters.startDate ? new Date(tempFilters.startDate) : undefined;
  const tempEndDate = tempFilters.endDate ? new Date(tempFilters.endDate) : undefined;

  return (
    <>
      {/* desktop view */}
      <div className="hidden md:block">
        <FilterBar>
          <DatePicker
            label="Start Date"
            date={startDate}
            onDateChange={(date) => updateFilter("sublets", "startDate", toDateString(date))}
          />
          <DatePicker
            label="End Date"
            date={endDate}
            onDateChange={(date) => updateFilter("sublets", "endDate", toDateString(date))}
          />
          <Select
            value={filters.sublets.numBeds || ""}
            onValueChange={(value) => updateFilter("sublets", "numBeds", value || undefined)}
            options={BEDS_OPTIONS}
            placeholder="Any Beds"
          />
          <Select
            value={filters.sublets.numBaths || ""}
            onValueChange={(value) => updateFilter("sublets", "numBaths", value || undefined)}
            options={BATHS_OPTIONS}
            placeholder="Any Baths"
          />
          <PriceRangeInput
            minValue={filters.sublets.minPrice || ""}
            maxValue={filters.sublets.maxPrice || ""}
            onMinChange={(value) => updateFilter("sublets", "minPrice", value || undefined)}
            onMaxChange={(value) => updateFilter("sublets", "maxPrice", value || undefined)}
          />
        </FilterBar>
      </div>

      {/* mobile view */}
      <div className="md:hidden flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <DatePicker
            label="Start Date"
            date={startDate}
            onDateChange={(date) => updateFilter("sublets", "startDate", toDateString(date))}
          />
          <DatePicker
            label="End Date"
            date={endDate}
            onDateChange={(date) => updateFilter("sublets", "endDate", toDateString(date))}
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                  <DatePicker
                    label="Start Date"
                    date={tempStartDate}
                    onDateChange={(date) => setTempFilters({ ...tempFilters, startDate: toDateString(date) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                  <DatePicker
                    label="End Date"
                    date={tempEndDate}
                    onDateChange={(date) => setTempFilters({ ...tempFilters, endDate: toDateString(date) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Number of Beds</label>
                  <Select
                    value={tempFilters.numBeds || ""}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, numBeds: value || undefined })}
                    options={BEDS_OPTIONS}
                    placeholder="Any Beds"
                    triggerClassName="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Number of Baths</label>
                  <Select
                    value={tempFilters.numBaths || ""}
                    onValueChange={(value) => setTempFilters({ ...tempFilters, numBaths: value || undefined })}
                    options={BATHS_OPTIONS}
                    placeholder="Any Baths"
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