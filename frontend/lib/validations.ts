import { z } from "zod";

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.replace(/\D/g, "")) // strip non-digits
    .refine(
      (val) => val.length === 10 || (val.length === 11 && val.startsWith("1")),
      {
        message: "Please enter a valid phone number",
      }
    )
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
  message: z
    .string()
    .max(500, "Message must be at most 500 characters")
    .optional(),
});

export type OfferFormData = z.infer<typeof offerSchema>;




export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  price: z.string()
    .trim()
    .min(1, "Price is required")
    .refine((s) => /^(\$?\d{1,3}(,\d{3})*|\$?\d+)(\.\d{1,2})?$/.test(s), { message: "Price must be a valid amount" })
    .transform((s) => Number(s.replace(/[$,]/g, "")))
    .refine((n) => n > 0, { message: "Price must be a positive number" }),
  negotiable: z.boolean().default(false),
  expires_at: z.string()
    .datetime("Expiration must be a valid date/time")
    .optional()
    .refine(
      (val) => !val || new Date(val).getTime() > Date.now(),
      { message: "Expiration must be in the future" }
    )
  external_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  condition: z.string().min(1, "Condition is required"),
  category: z.string().min(1, "Category is required"),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;


export const createSubletSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Price must be a positive number" }
  ),
  negotiable: z.boolean().default(false),
  expires_at: z.string().min(1, "Expiration date is required"),
  external_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  address: z.string().min(1, "Address is required"),
  beds: z.string().min(1, "Number of beds is required"),
  baths: z.string().min(1, "Number of baths is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  { message: "End date must be after start date", path: ["end_date"] }
);

export type CreateSubletFormData = z.infer<typeof createSubletSchema>;