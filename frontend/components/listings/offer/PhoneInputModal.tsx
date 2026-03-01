"use client";

import { useEffect } from "react";
import { Phone } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField } from "@/components/common/FormField";
import { sendVerificationCode } from "@/lib/actions";
import { formatPhoneNumber } from "@/lib/utils";
import { phoneSchema, type PhoneFormData } from "@/lib/validations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCodeSent: (phoneNumber: string) => void;
  listingOwnerLabel: string;
  initialPhoneNumber?: string;
}

export function PhoneInputModal({
  isOpen,
  onClose,
  onCodeSent,
  listingOwnerLabel,
  initialPhoneNumber = "",
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: {
      phoneNumber: initialPhoneNumber,
    },
  });

  const sendVerificationCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: (data, phoneNumber) => {
      toast.success("Verification code sent!");
      onCodeSent(phoneNumber);
    },
  });

  const handleSendVerificationCode = (data: PhoneFormData) => {
    sendVerificationCodeMutation.mutate(data.phoneNumber);
  };

  const isLoading = sendVerificationCodeMutation.isPending || isSubmitting;

  useEffect(() => {
    if (isOpen) {
      reset({ phoneNumber: initialPhoneNumber });
    }
  }, [isOpen, initialPhoneNumber, reset]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Phone Number"
      description={`We need to verify your phone number so the ${listingOwnerLabel.toLowerCase()} can contact you about your offer.`}
    >
      <form onSubmit={handleSubmit(handleSendVerificationCode)} className="space-y-4">
        <FormField
          label="Phone number"
          error={errors.phoneNumber?.message}
          touched={touchedFields.phoneNumber}
        >
          <div className="relative">
            <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formatPhoneNumber(field.value || "")}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    // limit to 10 digits (US phone number)
                    const limitedDigits = digits.slice(0, 10);
                    field.onChange(limitedDigits);
                  }}
                  onBlur={field.onBlur}
                  className={`pl-10 ${errors.phoneNumber && touchedFields.phoneNumber ? "border-destructive" : ""}`}
                  disabled={isLoading}
                  autoFocus
                  aria-invalid={errors.phoneNumber && touchedFields.phoneNumber ? "true" : "false"}
                />
              )}
            />
          </div>
        </FormField>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="bg-brand hover:bg-brand-hover h-12 w-full cursor-pointer text-white"
        >
          {isLoading ? "Sending..." : "Send Verification Code"}
        </Button>
      </form>
    </FormDialog>
  );
}
