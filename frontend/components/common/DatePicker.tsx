"use client";

import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseDateOnly, toDateOnlyString } from "@/lib/utils";

interface Props {
  label: string;
  value?: string; // "YYYY-MM-DD"
  onChange: (value?: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
}

export const DatePicker = ({ label, value, onChange, invalid, disabled, id }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const date = value ? parseDateOnly(value) : undefined;
  const displayValue = date ? format(date, "MMM d, yyyy") : undefined;

  return (
    <div className="relative flex-1">
      <Input
        type="date"
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        aria-invalid={invalid}
        disabled={disabled}
        className="bg-background h-10 pointer-fine:hidden"
      />
      <div className="pointer-coarse:hidden">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-label={displayValue ? `${label}: ${displayValue}` : label}
              aria-invalid={invalid}
              disabled={disabled}
              className="bg-background h-10 w-full justify-start pl-12 font-normal"
            >
              <span className="text-muted-foreground text-sm">{displayValue ?? label}</span>
            </Button>
          </PopoverTrigger>
          <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 transform" />
          <PopoverContent
            align="start"
            className="w-auto p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Calendar
              autoFocus
              mode="single"
              selected={date}
              defaultMonth={date}
              onSelect={(selectedDate) => {
                onChange(selectedDate ? toDateOnlyString(selectedDate) : undefined);
                setIsOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(undefined)}
          className="absolute top-1/2 right-2 z-20 size-7 -translate-y-1/2 text-gray-400 hover:text-gray-600 pointer-coarse:right-9"
          aria-label={`Clear ${label}`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
