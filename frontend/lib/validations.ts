import { z } from "zod";

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
