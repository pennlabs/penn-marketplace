"use client";

import { useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  invalid?: boolean;
  disabled?: boolean;
}

export const DatePicker = ({ label, date, onDateChange, invalid, disabled }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative flex-1">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-invalid={invalid}
            disabled={disabled}
            className="bg-background h-10 w-full justify-start pl-12 font-normal"
          >
            <span className="text-muted-foreground text-sm">
              {date ? format(date, "MMM d, yyyy") : label}
            </span>
          </Button>
        </PopoverTrigger>
        <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 transform" />
        {date && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(undefined)}
            className="absolute top-1/2 right-2 z-20 size-7 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {/* let the calendar focus the selected day (or today) instead of the first button */}
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
            onDateChange(selectedDate);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
