"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPhoneStatus, createOffer } from "@/lib/actions";
import { formatPhoneNumber } from "@/lib/utils";
import { offerSchema, type OfferFormData } from "@/lib/validations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingPrice: number;
  listingOwnerLabel: string;
  priceLabel?: string;
  onChangePhone: () => void;
}

export function MakeOfferModal({
  isOpen,
  onClose,
  listingId,
  listingPrice,
  listingOwnerLabel,
  priceLabel,
  onChangePhone,
}: Props) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    mode: "onChange",
    defaultValues: {
      offeredPrice: "",
      message: "",
    },
  });

  const { data: phoneStatus, isLoading: isLoadingPhone } = useQuery({
    queryKey: ["phoneStatus"],
    queryFn: getPhoneStatus,
    enabled: isOpen,
  });

  const createOfferMutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      toast.success(`Offer sent! The ${listingOwnerLabel.toLowerCase()} will contact you.`);
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send offer");
    },
  });

  const handleCreateOffer = (data: OfferFormData) => {
    if (!phoneStatus?.phone_verified || !phoneStatus?.phone_number) {
      toast.error("Phone verification required");
      return;
    }

    createOfferMutation.mutate({
      listingId,
      offeredPrice: parseFloat(data.offeredPrice),
      message: data.message?.trim() || undefined,
    });
  };

  const handleUseListingPrice = () => {
    setValue("offeredPrice", listingPrice.toString(), { shouldValidate: true });
  };

  const handleChangePhoneClick = () => {
    onClose();
    onChangePhone();
  };

  const isLoading = createOfferMutation.isPending || isSubmitting;

  // reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        offeredPrice: "",
        message: "",
      });
    }
  }, [isOpen, reset]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Make an Offer"
      description={`The ${listingOwnerLabel.toLowerCase()} will review your offer and contact you via phone.`}
    >
      <form onSubmit={handleSubmit(handleCreateOffer)} className="space-y-4">
        {/* phone number */}
        <FormField label="Your phone number">
          {isLoadingPhone ? (
            <div className="rounded-lg border bg-gray-50 p-3">
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  {formatPhoneNumber(phoneStatus?.phone_number || "")}
                </span>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-brand h-auto p-0 text-sm"
                onClick={handleChangePhoneClick}
              >
                Change
              </Button>
            </div>
          )}
        </FormField>

        {/* offer price */}
        <FormField
          label="Your offer"
          error={errors.offeredPrice?.message}
          touched={touchedFields.offeredPrice}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Listed: ${listingPrice.toLocaleString()}
              {priceLabel}
            </span>
            <Button
              type="button"
              variant="link"
              className="text-brand h-auto p-0 text-sm"
              onClick={handleUseListingPrice}
            >
              Use this price
            </Button>
          </div>
          <Controller
            name="offeredPrice"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-medium text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className={`pl-8 text-lg ${errors.offeredPrice && touchedFields.offeredPrice ? "border-destructive" : ""}`}
                  min="0"
                  step="0.01"
                  aria-invalid={
                    errors.offeredPrice && touchedFields.offeredPrice ? "true" : "false"
                  }
                />
              </div>
            )}
          />
        </FormField>

        {/* message */}
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <FormField
              label="Message"
              optional
              error={errors.message?.message}
              touched={touchedFields.message}
              helperText={`${field.value?.length || 0}/500 characters`}
            >
              <Textarea
                placeholder={`Add a message for the ${listingOwnerLabel.toLowerCase()}...`}
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={4}
                maxLength={500}
                className={`resize-none ${errors.message && touchedFields.message ? "border-destructive" : ""}`}
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                aria-invalid={errors.message && touchedFields.message ? "true" : "false"}
              />
            </FormField>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="bg-brand hover:bg-brand-hover h-12 w-full text-base text-white"
        >
          {isLoading ? "Submitting..." : "Submit Offer"}
        </Button>
      </form>
    </FormDialog>
  );
}
