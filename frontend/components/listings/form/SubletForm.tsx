"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { FormField } from "@/components/common/FormField";
import { FormSelect } from "@/components/common/FormSelect";
import { DatePicker } from "@/components/common/DatePicker";
import { AddressAutocomplete } from "@/components/listings/address/AddressAutocomplete";
import { BaseListingForm } from "@/components/listings/form/BaseListingForm";
import { ListingFormShell } from "@/components/listings/form/ListingFormShell";
import { useImageUpload } from "@/hooks/useImageUpload";
import { createListing, deleteListing, updateListing, uploadListingImages } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { BEDS_OPTIONS, BATHS_OPTIONS } from "@/lib/constants";
import { nextDateOnly, parsePriceString } from "@/lib/utils";
import { createSubletSchema } from "@/lib/validations";
import type { CreateSubletPayload, Sublet, UpdateSubletPayload } from "@/lib/types";
import type { CreateSubletFormData } from "@/lib/validations";

const DISPLAY_LABEL = "Listing";
const EXAMPLE_TITLE = "e.g., Spacious 2BR near campus";

type SubletFormProps = {
  initialListing?: Sublet;
};

export function SubletForm({ initialListing }: SubletFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(initialListing);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, touchedFields, dirtyFields, isDirty, isSubmitting },
  } = useForm<CreateSubletFormData>({
    resolver: zodResolver(createSubletSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: initialListing?.title ?? "",
      price: initialListing ? String(initialListing.price) : "",
      description: initialListing?.description ?? "",
      tags: [],
      street_address: initialListing?.additional_data.street_address ?? "",
      latitude: initialListing?.additional_data.latitude ?? 0,
      longitude: initialListing?.additional_data.longitude ?? 0,
      beds: initialListing?.additional_data.beds ?? 0,
      baths: initialListing?.additional_data.baths ?? 0,
      startDate: initialListing?.additional_data.start_date?.slice(0, 10) ?? "",
      endDate: initialListing?.additional_data.end_date?.slice(0, 10) ?? "",
    },
  });

  const imageUpload = useImageUpload({
    maxSizeBytes: 10 * 1024 * 1024,
    onError: (message) => toast.error(message),
    initialImages: initialListing?.images,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateSubletPayload | UpdateSubletPayload) =>
      isEditMode && initialListing
        ? updateListing(initialListing.id, payload as UpdateSubletPayload)
        : createListing(payload as CreateSubletPayload),
    onSuccess: async (data) => {
      if (isEditMode && initialListing) {
        queryClient.invalidateQueries({ queryKey: queryKeys.listing(initialListing.id) });
      } else {
        // images attach to an existing listing, so they upload after it's created.
        // wait for every upload to settle before rolling back on any failure.
        const files = imageUpload.getFiles();
        const results = await Promise.allSettled(
          files.map(async (file, index) => {
            const formData = new FormData();
            formData.append("images", file);
            // parallel uploads finish in any order, so tell the backend where this one goes
            formData.append("order", String(index));
            await uploadListingImages(data.id, formData);
          })
        );
        const failed = files
          .filter((_, index) => results[index].status === "rejected")
          .map((file) => file.name);

        if (failed.length > 0) {
          failed.forEach((name) => toast.error(`The file "${name}" could not be uploaded.`));
          try {
            await deleteListing(data.id); // cascades to any images already uploaded
            toast.error(`${DISPLAY_LABEL} was not created. Replace the file(s) and try again.`);
          } catch {
            toast.error(`${DISPLAY_LABEL} was created with missing images. Please delete it.`);
          }
          return; // keep the form filled in so the user can fix the files
        }
      }

      toast.success(`${DISPLAY_LABEL} ${isEditMode ? "updated" : "created"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["sublets"] });
      if (!isEditMode) {
        reset();
        imageUpload.clearImages();
      }
      router.replace(`/sublets/${data.id}`);
    },
  });

  const onSubmit = (data: CreateSubletFormData) => {
    const parsedPrice = parsePriceString(data.price);
    const additional_data = {
      street_address: data.street_address,
      beds: data.beds,
      baths: data.baths,
      start_date: data.startDate,
      end_date: data.endDate,
    };
    const coords = { latitude: data.latitude, longitude: data.longitude };
    // edit form is prefilled with the backend's approximate coords; only send them
    // after a fresh address selection, else the stored exact location drifts on save
    const addressChanged = dirtyFields.latitude || dirtyFields.longitude;
    const payload: CreateSubletPayload | UpdateSubletPayload = isEditMode
      ? {
          title: data.title,
          description: data.description ?? "",
          price: parsedPrice,
          listing_type: "sublet",
          additional_data: addressChanged ? { ...additional_data, ...coords } : additional_data,
        }
      : {
          title: data.title,
          description: data.description ?? "",
          price: String(parsedPrice),
          listing_type: "sublet",
          additional_data: { ...additional_data, ...coords },
        };
    mutate(payload);
  };

  const isFormDisabled = isPending || isSubmitting;
  const startDate = watch("startDate");

  const subletFieldsAfterPrice = (
    <>
      <Controller
        name="street_address"
        control={control}
        render={({ field: streetField }) => (
          <Controller
            name="latitude"
            control={control}
            render={({ field: latField }) => (
              <Controller
                name="longitude"
                control={control}
                render={({ field: lonField }) => (
                  <FormField
                    label={"Street Address"}
                    error={errors.street_address?.message}
                    touched={touchedFields.street_address}
                    labelSupplement={
                      <span className={"group relative inline-flex"}>
                        <Info
                          className={"text-muted-foreground h-4 w-4 shrink-0 cursor-help"}
                          aria-label="address privacy info"
                        />
                        <span
                          className={
                            "bg-popover text-popover-foreground pointer-events-none absolute top-full left-0 z-10 mt-1.5 w-56 rounded-md border px-3 py-2 text-xs opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
                          }
                        >
                          Your address will not be visible to the public. Only an approximate
                          location will be shown on the map.
                        </span>
                      </span>
                    }
                  >
                    <AddressAutocomplete
                      value={streetField.value}
                      onChange={streetField.onChange}
                      onValidatedAddressChange={(addr) => {
                        latField.onChange(addr ? parseFloat(addr.lat) : 0);
                        lonField.onChange(addr ? parseFloat(addr.lon) : 0);
                      }}
                      disabled={isFormDisabled}
                      error={!!errors.street_address}
                      placeholder={"123 Main St 19104"}
                    />
                  </FormField>
                )}
              />
            )}
          />
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
          // re-check the end date error when the start date moves
          rules={{ deps: "endDate" }}
          render={({ field }) => (
            <FormField
              label="Start Date"
              htmlFor="startDate"
              error={errors.startDate?.message}
              touched={touchedFields.startDate}
            >
              <DatePicker
                id="startDate"
                label="Start Date"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value ?? "");
                  field.onBlur();
                }}
                onBlur={field.onBlur}
                invalid={!!errors.startDate && touchedFields.startDate}
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
              htmlFor="endDate"
              error={errors.endDate?.message}
              touched={touchedFields.endDate}
            >
              <DatePicker
                id="endDate"
                label="End Date"
                value={field.value}
                minDate={startDate ? nextDateOnly(startDate) : undefined}
                onChange={(value) => {
                  field.onChange(value ?? "");
                  field.onBlur();
                }}
                onBlur={field.onBlur}
                invalid={!!errors.endDate && touchedFields.endDate}
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
      submitLabel={isEditMode ? "Save Changes" : undefined}
      pendingLabel={isEditMode ? "Saving..." : undefined}
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
