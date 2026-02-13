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

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
