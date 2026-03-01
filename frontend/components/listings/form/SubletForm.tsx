"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { FormSelect } from "@/components/common/FormSelect";
import { BaseListingForm } from "@/components/listings/form/BaseListingForm";
import { ListingFormShell } from "@/components/listings/form/ListingFormShell";
import { useImageUpload } from "@/hooks/useImageUpload";
import { createListing } from "@/lib/actions";
import { BEDS_OPTIONS, BATHS_OPTIONS } from "@/lib/constants";
import { parsePriceString } from "@/lib/utils";
import { createSubletSchema } from "@/lib/validations";
import type { CreateSubletPayload } from "@/lib/types";
import type { CreateSubletFormData } from "@/lib/validations";

const DISPLAY_LABEL = "Listing";
const EXAMPLE_TITLE = "e.g., Spacious 2BR near campus";

export function SubletForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isDirty, isSubmitting },
  } = useForm<CreateSubletFormData>({
    resolver: zodResolver(createSubletSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      price: "",
      description: "",
      tags: [],
      streetAddress: "",
      beds: 0,
      baths: 0,
      startDate: "",
      endDate: "",
    },
  });

  const imageUpload = useImageUpload({
    maxFiles: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    onError: (message) => toast.error(message),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createListing,
    onSuccess: (data) => {
      toast.success(`${DISPLAY_LABEL} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["sublets"] });
      reset();
      imageUpload.clearImages();
      router.replace(`/sublets/${data.id}`);
    },
  });

  const onSubmit = (data: CreateSubletFormData) => {
    const payload: CreateSubletPayload = {
      title: data.title,
      description: data.description,
      price: String(parsePriceString(data.price)),
      listing_type: "sublet",
      additional_data: {
        street_address: data.streetAddress,
        beds: data.beds,
        baths: data.baths,
        start_date: data.startDate,
        end_date: data.endDate,
      },
    };
    mutate(payload);
  };

  const isFormDisabled = isPending || isSubmitting;

  const subletFieldsAfterPrice = (
    <>
      <Controller
        name="streetAddress"
        control={control}
        render={({ field }) => (
          <FormField
            label="Street Address"
            error={errors.streetAddress?.message}
            touched={touchedFields.streetAddress}
            labelSupplement={
              <span className="group relative inline-flex">
                <Info
                  className="text-muted-foreground h-4 w-4 shrink-0 cursor-help"
                  aria-label="Address privacy info"
                />
                <span className="bg-popover text-popover-foreground pointer-events-none absolute top-full left-0 z-10 mt-1.5 w-56 rounded-md border px-3 py-2 text-xs opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                  Your address will not be visible to the public. Only an approximate location will
                  be shown on the map.
                </span>
              </span>
            }
          >
            <Input
              {...field}
              placeholder="123 Main St, Philadelphia, PA 19104"
              aria-invalid={!!errors.streetAddress}
              disabled={isFormDisabled}
              autoComplete="street-address"
            />
          </FormField>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="beds"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Bedrooms"
              valueType="number"
              value={field.value}
              onChange={field.onChange}
              options={BEDS_OPTIONS}
              placeholder="Select beds"
              error={errors.beds?.message}
              touched={touchedFields.beds}
            />
          )}
        />
        <Controller
          name="baths"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Bathrooms"
              valueType="number"
              value={field.value}
              onChange={field.onChange}
              options={BATHS_OPTIONS}
              placeholder="Select baths"
              error={errors.baths?.message}
              touched={touchedFields.baths}
            />
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <FormField
              label="Start Date"
              error={errors.startDate?.message}
              touched={touchedFields.startDate}
            >
              <Input
                {...field}
                type="date"
                aria-invalid={!!errors.startDate}
                disabled={isFormDisabled}
              />
            </FormField>
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <FormField
              label="End Date"
              error={errors.endDate?.message}
              touched={touchedFields.endDate}
            >
              <Input
                {...field}
                type="date"
                aria-invalid={!!errors.endDate}
                disabled={isFormDisabled}
              />
            </FormField>
          )}
        />
      </div>
    </>
  );

  return (
    <ListingFormShell
      onSubmit={handleSubmit(onSubmit)}
      isFormDisabled={isFormDisabled}
      isPending={isPending}
      displayLabel={DISPLAY_LABEL}
      imageUpload={imageUpload}
    >
      <BaseListingForm<CreateSubletFormData>
        control={control}
        errors={errors}
        touchedFields={touchedFields as Partial<Record<keyof CreateSubletFormData, boolean>>}
        disabled={isFormDisabled}
        displayLabel={DISPLAY_LABEL}
        exampleTitle={EXAMPLE_TITLE}
        isSublet
        abandonGuard={{
          isDirty,
          unsavedImageCount: imageUpload.images.length,
        }}
        childrenAfterPrice={subletFieldsAfterPrice}
      />
    </ListingFormShell>
  );
}
