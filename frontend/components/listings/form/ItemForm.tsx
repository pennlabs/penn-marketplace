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
import { createListing } from "@/lib/actions";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { parsePriceString } from "@/lib/utils";
import { type CreateItemFormData, createItemSchema } from "@/lib/validations";
import type { CreateItemPayload } from "@/lib/types";

const DISPLAY_LABEL = "Item";
const EXAMPLE_TITLE = "e.g., Nike Air Force 1";

export function ItemForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
      title: "",
      price: "",
      description: "",
      tags: [],
      condition: undefined,
      category: undefined,
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
      queryClient.invalidateQueries({ queryKey: ["items"] });
      reset();
      imageUpload.clearImages();
      router.replace(`/items/${data.id}`);
    },
  });

  const onSubmit = (data: CreateItemFormData) => {
    const payload: CreateItemPayload = {
      title: data.title,
      description: data.description,
      price: String(parsePriceString(data.price)),
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
