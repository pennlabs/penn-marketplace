import { useState, useCallback, useRef, useEffect } from "react";
import type { NominatimAddress } from "@/lib/types";

export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<NominatimAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        // Philly bounding box
        const viewbox = "-75.28,39.87,-74.96,40.14";

        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "5",
          addressdetails: "1",
          bounded: "1",
          viewbox: viewbox,
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            signal: abortControllerRef.current.signal,
            headers: {
              // user agent required by Nominatim
              "User-Agent": "PennMarketPlace/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NominatimAddress[] = await response.json();
        setSuggestions(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Address search error:", err);
        setError("Failed to fetch addresses. Please try again.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { suggestions, isLoading, error, search, clearSuggestions };
}
