"use client";

import { DatePicker } from "@/components/Filters/DatePicker";
import { useFilters } from "@/providers/FiltersProvider";

export const DateSearch = () => {
  const { filters, updateFilter } = useFilters();
  const { startDate: startDateStr, endDate: endDateStr } = filters.sublets;

  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  const handleDateChange = (date: Date | undefined, type: "startDate" | "endDate") => {
    updateFilter("sublets", type, date ? date.toISOString().split('T')[0] : undefined);
  };

  return (
    <div className="w-full md:max-w-2xl flex flex-col sm:flex-row gap-2">
      <DatePicker
        label="Start Date"
        date={startDate}
        onDateChange={(date) => handleDateChange(date, "startDate")}
      />
      <DatePicker
        label="End Date"
        date={endDate}
        onDateChange={(date) => handleDateChange(date, "endDate")}
      />
    </div>
  );
};