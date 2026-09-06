"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import type { Offer } from "@/lib/types";
import { offerSchema, type OfferFormData } from "@/lib/validations";
import { updateMyOfferDetails } from "@/lib/actions";
import { parsePriceString } from "@/lib/utils";
import { FormDialog } from "@/components/common/FormDialog";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function EditMyOfferModal({
  isOpen,
  onClose,
  offer,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    mode: "onChange",
    defaultValues: {
      offeredPrice: "",
      message: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        offeredPrice: offer.offered_price.toString(),
        message: offer.message ?? "",
      });
    }
  }, [isOpen, offer, reset]);

  const editMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      return updateMyOfferDetails(offer.id, {
        offeredPrice: parsePriceString(data.offeredPrice),
        message: data.message?.trim() || "",
      });
    },
    onMutate: async (data: OfferFormData) => {
      await queryClient.cancelQueries({ queryKey: ["myOffer", offer.listing] });
      const previousOffer = queryClient.getQueryData<Offer | null>(["myOffer", offer.listing]);
      queryClient.setQueryData<Offer | null>(["myOffer", offer.listing], {
        ...offer,
        offered_price: parsePriceString(data.offeredPrice),
        message: data.message?.trim() || "",
      });
      return { previousOffer };
    },
    onSuccess: (updatedOffer) => {
      toast.success("Offer updated!");
      queryClient.setQueryData(["myOffer", offer.listing], updatedOffer);
      onSaved();
    },
    onError: (_error, _vars, context) => {
      if (context?.previousOffer !== undefined) {
        queryClient.setQueryData(["myOffer", offer.listing], context.previousOffer);
      }
      toast.error("Failed to update offer.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["myOffer", offer.listing] });
    },
  });

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit your offer"
      description="Update the offered price and your message. Offer status is controlled by the listing owner."
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit((data) => editMutation.mutate(data))}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Pencil className="h-4 w-4" />
          <span>Current status: {offer.status}</span>
        </div>

        <FormField
          label="Your offer"
          error={errors.offeredPrice?.message}
          touched={touchedFields.offeredPrice}
        >
          <Controller
            name="offeredPrice"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="0"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={
                  errors.offeredPrice && touchedFields.offeredPrice
                    ? "border-destructive"
                    : ""
                }
                min="0"
                step="0.01"
              />
            )}
          />
        </FormField>

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
                placeholder="Add a message for the listing owner..."
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={4}
                maxLength={500}
                className={`resize-none ${
                  errors.message && touchedFields.message ? "border-destructive" : ""
                }`}
              />
            </FormField>
          )}
        />

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={editMutation.isPending || isSubmitting || !isValid}
          >
            {editMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}