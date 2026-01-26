"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField } from "@/components/common/FormField";
import { verifyPhoneCode, sendVerificationCode } from "@/lib/actions";
import { formatPhoneNumber } from "@/lib/utils";
import { verificationCodeSchema, type VerificationCodeFormData } from "@/lib/validations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerified: () => void;
}

export function VerificationCodeModal({ isOpen, onClose, phoneNumber, onVerified }: Props) {
  // countdown timer for resending code so user can't spam the button
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<VerificationCodeFormData>({
    resolver: zodResolver(verificationCodeSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: ({ phoneNumber, code }: { phoneNumber: string; code: string }) =>
      verifyPhoneCode(phoneNumber, code),
    onSuccess: () => {
      toast.success("Phone number verified!");
      onVerified();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid or expired code");
      reset({ code: "" });
    },
  });

  const resendVerificationCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      toast.success("New code sent!");
      reset({ code: "" });
      setResendCooldown(30);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend code");
    },
  });

  const handleVerifyCode = (data: VerificationCodeFormData) => {
    verifyCodeMutation.mutate({ phoneNumber, code: data.code });
  };

  const handleResendVerificationCode = () => {
    resendVerificationCodeMutation.mutate(phoneNumber);
  };

  const isLoading = verifyCodeMutation.isPending || isSubmitting;

  useEffect(() => {
    if (isOpen) {
      reset({ code: "" });
      setResendCooldown(30);
    }
  }, [isOpen, reset]);

  // side effect for countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Enter Verification Code"
      description={
        <span>
          We sent a 6-digit code to <strong>{formatPhoneNumber(phoneNumber)}</strong>
        </span>
      }
    >
      <form onSubmit={handleSubmit(handleVerifyCode)} className="space-y-4">
        <FormField label="" error={errors.code?.message} touched={touchedFields.code}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="000000"
                value={field.value || ""}
                onChange={(e) => {
                  // only allow digits, limit to 6
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                  field.onChange(digitsOnly);
                }}
                onBlur={field.onBlur}
                maxLength={6}
                className={`text-center font-mono text-2xl tracking-widest ${
                  errors.code && touchedFields.code ? "border-destructive" : ""
                }`}
                disabled={isLoading}
                autoFocus
                aria-invalid={errors.code && touchedFields.code ? "true" : "false"}
              />
            )}
          />
        </FormField>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="bg-brand hover:bg-brand-hover h-12 w-full text-white"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendVerificationCode}
            disabled={resendVerificationCodeMutation.isPending || resendCooldown > 0}
            className="w-full text-sm"
          >
            {resendVerificationCodeMutation.isPending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend code (${resendCooldown}s)`
                : "Resend code"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
