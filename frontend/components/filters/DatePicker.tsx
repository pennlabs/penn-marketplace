"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export const DatePicker = ({ label, date, onDateChange }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background h-10 w-full justify-start pl-12 font-normal"
        >
          <span className="text-muted-foreground text-sm">
            {date ? format(date, "MMM d, yyyy") : label}
          </span>
        </Button>
        <CalendarIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 transform" />
        {date && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-4 z-20 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isOpen && (
        <Calendar
          className="absolute top-full left-0 z-50 mt-2 rounded-md border shadow-lg shadow-sm"
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};
