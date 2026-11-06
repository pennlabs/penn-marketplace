"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormSelect } from "@/components/common/FormSelect";
import { BaseListingForm } from "@/components/listings/form/BaseListingForm";
import { ListingFormShell } from "@/components/listings/form/ListingFormShell";
import { useImageUpload } from "@/hooks/useImageUpload";
import { createListing, deleteListing, updateListing, uploadListingImages } from "@/lib/actions";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { queryKeys } from "@/lib/queryKeys";
import { parsePriceString } from "@/lib/utils";
import { type CreateItemFormData, createItemSchema } from "@/lib/validations";
import type { CreateItemPayload, Item, UpdateItemPayload } from "@/lib/types";

const DISPLAY_LABEL = "Item";
const EXAMPLE_TITLE = "e.g., Nike Air Force 1";

type ItemFormProps = {
  initialListing?: Item;
};

export function ItemForm({ initialListing }: ItemFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(initialListing);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields, isDirty, isSubmitting },
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: initialListing?.title ?? "",
      price: initialListing ? String(initialListing.price) : "",
      description: initialListing?.description ?? "",
      tags: [],
      condition: initialListing?.additional_data.condition_code,
      category: initialListing?.additional_data.category,
    },
  });

  const imageUpload = useImageUpload({
    maxSizeBytes: 10 * 1024 * 1024,
    onError: (message) => toast.error(message),
    initialImages: initialListing?.images,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateItemPayload | UpdateItemPayload) =>
      isEditMode && initialListing
        ? updateListing(initialListing.id, payload as UpdateItemPayload)
        : createListing(payload as CreateItemPayload),
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
      queryClient.invalidateQueries({ queryKey: ["items"] });
      if (!isEditMode) {
        reset();
        imageUpload.clearImages();
      }
      router.replace(`/items/${data.id}`);
    },
  });

  const onSubmit = (data: CreateItemFormData) => {
    const parsedPrice = parsePriceString(data.price);
    const payload: CreateItemPayload | UpdateItemPayload = isEditMode
      ? {
          title: data.title,
          description: data.description,
          price: parsedPrice,
          listing_type: "item",
          additional_data: {
            condition: data.condition,
            category: data.category,
          },
        }
      : {
          title: data.title,
          description: data.description,
          price: String(parsedPrice),
          listing_type: "item",
          additional_data: {
            condition: data.condition,
            category: data.category,
          },
        };
    mutate(payload);
  };

  const isFormDisabled = isPending || isSubmitting;

  const itemFieldsAfterDescription = (
    <>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Product Category"
            value={field.value}
            onChange={field.onChange}
            options={CATEGORY_OPTIONS}
            placeholder="Select Category"
            error={errors.category?.message}
            touched={touchedFields.category}
          />
        )}
      />
      <Controller
        name="condition"
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Condition"
            value={field.value}
            onChange={field.onChange}
            options={CONDITION_OPTIONS}
            placeholder="Select Condition"
            error={errors.condition?.message}
            touched={touchedFields.condition}
          />
        )}
      />
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
      <BaseListingForm<CreateItemFormData>
        control={control}
        errors={errors}
        touchedFields={touchedFields as Partial<Record<keyof CreateItemFormData, boolean>>}
        disabled={isFormDisabled}
        displayLabel={DISPLAY_LABEL}
        exampleTitle={EXAMPLE_TITLE}
        abandonGuard={{
          isDirty,
          unsavedImageCount: imageUpload.images.length,
        }}
        childrenAfterDescription={itemFieldsAfterDescription}
      />
    </ListingFormShell>
  );
}
