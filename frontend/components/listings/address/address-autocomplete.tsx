"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import type { NominatimAddress, ValidatedAddress } from "@/lib/types";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";
import { Input } from "@/components/ui/input";
import { AddressDropdown } from "./address-dropdown";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onValidatedAddressChange: (address: ValidatedAddress | null) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onValidatedAddressChange,
  disabled = false,
  error = false,
  placeholder = "123 Main St, Philadelphia, PA 19104",
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasValidatedAddress, setHasValidatedAddress] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    suggestions,
    isLoading,
    error: apiError,
    search,
    clearSuggestions,
  } = useAddressAutocomplete();

  useEffect(() => {
    if (value.trim().length > 0 && !hasValidatedAddress) {
      search(value);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else if (!hasValidatedAddress) {
      clearSuggestions();
      setIsOpen(false);
    }
  }, [value, search, clearSuggestions, hasValidatedAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (hasValidatedAddress) {
      onValidatedAddressChange(null);
      setHasValidatedAddress(false);
    }
  };

  const handleSelect = (address: NominatimAddress) => {
    const validatedAddress: ValidatedAddress = {
      display_name: address.display_name,
      lat: address.lat,
      lon: address.lon,
      place_id: address.place_id,
    };

    onChange(address.display_name);
    onValidatedAddressChange(validatedAddress);
    setHasValidatedAddress(true);
    setIsOpen(false);
    clearSuggestions();
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange("");
    onValidatedAddressChange(null);
    setHasValidatedAddress(false);
    setIsOpen(false);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        clearSuggestions();
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={"relative"} ref={containerRef}>
      <div className={"relative"}>
        <Input
          ref={inputRef}
          type={"text"}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim().length >= 3) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            hasValidatedAddress && "pr-9",
            error && "border-destructive ring-destructive/20"
          )}
          role={"combobox"}
          aria-expanded={isOpen}
          aria-autocomplete={"list"}
          aria-controls={"address-dropdown"}
          aria-activedescendant={
            highlightedIndex >= 0 ? `address-option-${highlightedIndex}` : undefined
          }
        />

        {hasValidatedAddress && !disabled && (
          <button
            type={"button"}
            onClick={handleClear}
            className={cn(
              "absolute top-1/2 right-2 -translate-y-1/2",
              "flex size-5 items-center justify-center rounded-sm",
              "text-muted-foreground hover:text-foreground",
              "transition-colors"
            )}
            aria-label={"Clear address"}
          >
            <X className={"size-4"} />
          </button>
        )}
      </div>

      <AddressDropdown
        suggestions={suggestions}
        isLoading={isLoading}
        error={apiError}
        isOpen={isOpen}
        onSelect={handleSelect}
        highlightedIndex={highlightedIndex}
      />
    </div>
  );
}
