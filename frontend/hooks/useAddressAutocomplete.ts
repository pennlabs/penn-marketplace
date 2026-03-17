import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

export function useAddressAutocomplete() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  const {
    data: suggestions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["geocode", debouncedQuery],
    queryFn: () =>
      fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`).then((r) => {
        if (!r.ok) throw new Error("failed to fetch addresses");
        return r.json();
      }),
    enabled: debouncedQuery.length >= 3,
  });

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSuggestions = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
  }, []);

  return { suggestions, isLoading, error: error?.message || null, search, clearSuggestions };
}
