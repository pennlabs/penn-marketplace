"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormField } from "@/components/common/FormField";
import { FormSelect } from "@/components/common/FormSelect";
import { BaseListingForm } from "@/components/listings/form/BaseListingForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateListing } from "@/lib/actions";
import { BATHS_OPTIONS, BEDS_OPTIONS, CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { parsePriceString } from "@/lib/utils";
import type { Item, ItemCategory, ItemCondition, Sublet, UpdateItemPayload, UpdateSubletPayload } from "@/lib/types";
import {
  editItemSchema,
  editSubletSchema,
  type EditItemFormData,
  type EditSubletFormData,
} from "@/lib/validations";

const resolveConditionValue = (condition: ItemCondition | string): ItemCondition => {
  const match = CONDITION_OPTIONS.find((option) => option.label === condition);
  return match ? match.value : (condition as ItemCondition);
};

function EditItemForm({ listing }: { listing: Item }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      condition: resolveConditionValue(listing.additional_data.condition),
      category: listing.additional_data.category,
    },
  });

  useEffect(() => {
    reset({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      condition: resolveConditionValue(listing.additional_data.condition),
      category: listing.additional_data.category,
    });
  }, [listing, reset]);

  const editMutation = useMutation({
    mutationFn: (data: EditItemFormData) => {
      const payload: UpdateItemPayload = {
        title: data.title,
        description: data.description,
        price: parsePriceString(data.price),
        listing_type: "item",
        additional_data: {
          condition: data.condition,
          category: data.category,
        },
      };
      return updateListing(listing.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", listing.id] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      router.replace(`/items/${listing.id}`);
    },
  });

  const itemFieldsAfterDescription = (
    <>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Product Category"
            value={field.value}
            onChange={(value) => field.onChange(value as ItemCategory)}
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
            onChange={(value) => field.onChange(value as ItemCondition)}
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
    <form onSubmit={handleSubmit((data) => editMutation.mutate(data))} className="space-y-6">
      <BaseListingForm<EditItemFormData>
        control={control}
        errors={errors}
        touchedFields={touchedFields as Partial<Record<keyof EditItemFormData, boolean>>}
        disabled={editMutation.isPending}
        displayLabel="Item"
        exampleTitle="e.g., Nike Air Force 1"
        childrenAfterDescription={itemFieldsAfterDescription}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">
          Cancel
        </Button>
        <Button type="submit" className="cursor-pointer" disabled={editMutation.isPending}>
          {editMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function EditSubletForm({ listing }: { listing: Sublet }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toDateInput = (date: string | undefined) => (date ? date.slice(0, 10) : "");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<EditSubletFormData>({
    resolver: zodResolver(editSubletSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      street_address: listing.additional_data.street_address,
      beds: listing.additional_data.beds,
      baths: listing.additional_data.baths,
      start_date: toDateInput(listing.additional_data.start_date),
      end_date: toDateInput(listing.additional_data.end_date),
    },
  });

  useEffect(() => {
    reset({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      street_address: listing.additional_data.street_address,
      beds: listing.additional_data.beds,
      baths: listing.additional_data.baths,
      start_date: toDateInput(listing.additional_data.start_date),
      end_date: toDateInput(listing.additional_data.end_date),
    });
  }, [listing, reset]);

  const editMutation = useMutation({
    mutationFn: (data: EditSubletFormData) => {
      const payload: UpdateSubletPayload = {
        title: data.title,
        description: data.description,
        price: parsePriceString(data.price),
        listing_type: "sublet",
        additional_data: {
          street_address: data.street_address,
          beds: data.beds,
          baths: data.baths,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      };
      return updateListing(listing.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", listing.id] });
      queryClient.invalidateQueries({ queryKey: ["sublets"] });
      router.replace(`/sublets/${listing.id}`);
    },
  });

  const subletFieldsAfterPrice = (
    <>
      <Controller
        name="street_address"
        control={control}
        render={({ field }) => (
          <FormField
            label="Street Address"
            error={errors.street_address?.message}
            touched={touchedFields.street_address}
          >
            <Input
              {...field}
              placeholder="123 Main St, Philadelphia, PA 19104"
              aria-invalid={!!errors.street_address}
              disabled={editMutation.isPending}
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
          name="start_date"
          control={control}
          render={({ field }) => (
            <FormField label="Start Date" error={errors.start_date?.message} touched={touchedFields.start_date}>
              <Input
                {...field}
                type="date"
                aria-invalid={!!errors.start_date}
                disabled={editMutation.isPending}
              />
            </FormField>
          )}
        />
        <Controller
          name="end_date"
          control={control}
          render={({ field }) => (
            <FormField label="End Date" error={errors.end_date?.message} touched={touchedFields.end_date}>
              <Input
                {...field}
                type="date"
                aria-invalid={!!errors.end_date}
                disabled={editMutation.isPending}
              />
            </FormField>
          )}
        />
      </div>
    </>
  );

  return (
    <form onSubmit={handleSubmit((data) => editMutation.mutate(data))} className="space-y-6">
      <BaseListingForm<EditSubletFormData>
        control={control}
        errors={errors}
        touchedFields={touchedFields as Partial<Record<keyof EditSubletFormData, boolean>>}
        disabled={editMutation.isPending}
        displayLabel="Listing"
        exampleTitle="e.g., Spacious 2BR near campus"
        isSublet
        childrenAfterPrice={subletFieldsAfterPrice}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">
          Cancel
        </Button>
        <Button type="submit" className="cursor-pointer" disabled={editMutation.isPending}>
          {editMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export function EditListingForm({ listing }: { listing: Item | Sublet }) {
  return listing.listing_type === "item" ? (
    <EditItemForm listing={listing} />
  ) : (
    <EditSubletForm listing={listing} />
  );
}
