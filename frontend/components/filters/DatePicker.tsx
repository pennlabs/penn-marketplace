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

export const DatePicker = ({
  label,
  date,
  onDateChange
}: Props) => {
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
          className="w-full h-10 justify-start font-normal pl-12 bg-background"
        >
          <span className="text-sm text-muted-foreground">
            {date ? format(date, "MMM d, yyyy") : label}
          </span>
        </Button>
        <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" />
        {date && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isOpen && (
        <Calendar
          className="absolute top-full left-0 mt-2 z-50 rounded-md border shadow-sm shadow-lg"
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