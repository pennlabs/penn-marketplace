import { z } from "zod";
import type { ItemCondition, ItemCategory } from "@/lib/types";

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.replace(/\D/g, "")) // strip non-digits
    .refine((val) => val.length === 10 || (val.length === 11 && val.startsWith("1")), {
      message: "Please enter a valid phone number",
    })
    .transform((val) => (val.startsWith("1") ? val.slice(1) : val)), // remove leading 1 if present
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

export type VerificationCodeFormData = z.infer<typeof verificationCodeSchema>;

export const offerSchema = z.object({
  offeredPrice: z
    .string()
    .min(1, "Offer amount is required")
    .refine(
      (val) => {
        const cleaned = val.replace(/[^0-9.]/g, "");
        const num = parseFloat(cleaned);
        return !isNaN(num) && num > 0;
      },
      { message: "Please enter a valid offer amount" }
    )
    .refine(
      (val) => {
        const cleaned = val.replace(/[^0-9.]/g, "");
        const num = parseFloat(cleaned);
        return num <= 1000000;
      },
      { message: "Offer amount is too large" }
    )
    .refine(
      (val) => {
        const cleaned = val.replace(/[^0-9.]/g, "");
        const decimalPart = cleaned.split(".")[1];
        return !decimalPart || decimalPart.length <= 2;
      },
      { message: "Maximum 2 decimal places allowed" }
    ),
  message: z.string().max(500, "Message must be at most 500 characters").optional(),
});

export type OfferFormData = z.infer<typeof offerSchema>;

// price validation regex: allows optional $, comma-separated thousands, optional decimals (up to 2)
const priceRegex = /^(\$?\d{1,3}(,\d{3})*|\$?\d+)(\.\d{1,2})?$/;

const priceSchema = z
  .string()
  .trim()
  .min(1, "Price is required")
  .refine((s) => priceRegex.test(s), { message: "Price must be a valid amount" })
  .refine(
    (s) => {
      const num = Number(s.replace(/[$,]/g, ""));
      return num > 0;
    },
    { message: "Price must be a positive number" }
  );

// Zod schemas using the actual enum values from types.ts
const itemConditionValues = [
  "NEW",
  "LIKE_NEW",
  "GOOD",
  "FAIR",
] as const satisfies readonly ItemCondition[];
const itemCategoryValues = [
  "Art",
  "Books",
  "Clothing",
  "Electronics",
  "Furniture",
  "Home and Garden",
  "Music",
  "Other",
  "Tools",
  "Vehicles",
] as const satisfies readonly ItemCategory[];

export const createItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  price: priceSchema,
  tags: z.array(z.string().trim()),
  condition: z.enum(itemConditionValues, "Condition is required"),
  category: z.enum(itemCategoryValues, "Category is required"),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;

export const createSubletSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .trim()
      .max(5000, "Description must be less than 5000 characters")
      .optional(),
    price: priceSchema,
    tags: z.array(z.string().trim()),
    street_address: z.string().trim().min(1, "Street address is required"),
    beds: z.number().int().min(0, "Beds must be 0 or more"),
    baths: z.number().int().min(0, "Baths must be 0 or more"),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date is required"),
  })
  .refine(
    (data) => {
      const start = Date.parse(data.start_date);
      const end = Date.parse(data.end_date);
      return Number.isFinite(start) && Number.isFinite(end) && end > start;
    },
    { message: "End date must be after start date", path: ["end_date"] }
  );

export type CreateSubletFormData = z.infer<typeof createSubletSchema>;
