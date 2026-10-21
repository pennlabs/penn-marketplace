import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, showMonthly: boolean = false) {
  const formatted = `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  return showMonthly ? `${formatted}/mo` : formatted;
}

// parse a price string (with optional $, commas) to a number. Use when building API payloads from form data.
export function parsePriceString(price: string): number {
  return Number(price.replace(/[$,]/g, ""));
}

// timestamps are shown in Penn's time zone so the server render and the browser always agree
const DISPLAY_TIME_ZONE = "America/New_York";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * format a date for display, "Sep 15" by default (pass options for other formats).
 * - date-only strings ("2026-09-15", e.g. sublet dates) are calendar dates, so they're parsed as
 *   local dates and never shift by a day
 * - full timestamps ("2026-08-26T14:00:00Z", e.g. created_at) are shown in DISPLAY_TIME_ZONE
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
) {
  if (DATE_ONLY_PATTERN.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", options);
  }
  return new Date(dateString).toLocaleDateString("en-US", {
    ...options,
    timeZone: DISPLAY_TIME_ZONE,
  });
}

// e.g. "Sep 15 - Dec 20"
export function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// e.g. "Studio", "1 bed", "2 beds"
export function formatBeds(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} ${beds === 1 ? "bed" : "beds"}`;
}

// e.g. "1 bath", "2 baths"
export function formatBaths(baths: number): string {
  return `${baths} ${baths === 1 ? "bath" : "baths"}`;
}

// format phone number as (XXX) XXX-XXXX
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// format condition for display
export function formatCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    NEW: "New",
    LIKE_NEW: "Like New",
    GOOD: "Good",
    FAIR: "Fair",
  };

  return conditionMap[condition] || condition;
}
