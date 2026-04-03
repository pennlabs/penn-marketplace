"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormField } from "@/components/common/FormField";
import { FormSelect } from "@/components/common/FormSelect";
import { BaseListingForm } from "@/components/listings/form/BaseListingForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateListing } from "@/lib/actions";
import { BEDS_OPTIONS, BATHS_OPTIONS, CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import { parsePriceString } from "@/lib/utils";
import type { Item, Sublet, UpdateItemPayload, UpdateSubletPayload } from "@/lib/types";
import {
  editItemSchema,
  editSubletSchema,
  type EditItemFormData,
  type EditSubletFormData,
} from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  listing: Item | Sublet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const resolveConditionValue = (condition: string) =>
  CONDITION_OPTIONS.find((option) => option.label === condition)?.value ?? condition;

const EditItemContent = ({
  listing,
  open,
  onSuccess,
}: {
  listing: Item;
  open: boolean;
  onSuccess: () => void;
}) => {
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
    if (open) {
      reset({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        condition: resolveConditionValue(listing.additional_data.condition),
        category: listing.additional_data.category,
      });
    }
  }, [open, listing, reset]);

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
      onSuccess();
    },
  });

  const isDisabled = editMutation.isPending;

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
    <>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-1">
        <BaseListingForm<EditItemFormData>
          control={control}
          errors={errors}
          touchedFields={touchedFields as Partial<Record<keyof EditItemFormData, boolean>>}
          disabled={isDisabled}
          displayLabel="Item"
          exampleTitle="e.g., Nike Air Force 1"
          childrenAfterDescription={itemFieldsAfterDescription}
        />
      </div>
      <DialogFooter>
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => onSuccess()}
          type="button"
        >
          Cancel
        </Button>
        <Button
          className="cursor-pointer"
          onClick={handleSubmit((data) => editMutation.mutate(data))}
          disabled={isDisabled}
        >
          {editMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
};

const EditSubletContent = ({
  listing,
  open,
  onSuccess,
}: {
  listing: Sublet;
  open: boolean;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();
  const toDateInput = (d: string | undefined) => (d ? d.slice(0, 10) : "");

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
    if (open) {
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
    }
  }, [open, listing, reset]);

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
      onSuccess();
    },
  });

  const isDisabled = editMutation.isPending;

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
              disabled={isDisabled}
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
            <FormField
              label="Start Date"
              error={errors.start_date?.message}
              touched={touchedFields.start_date}
            >
              <Input
                {...field}
                type="date"
                aria-invalid={!!errors.start_date}
                disabled={isDisabled}
              />
            </FormField>
          )}
        />
        <Controller
          name="end_date"
          control={control}
          render={({ field }) => (
            <FormField
              label="End Date"
              error={errors.end_date?.message}
              touched={touchedFields.end_date}
            >
              <Input
                {...field}
                type="date"
                aria-invalid={!!errors.end_date}
                disabled={isDisabled}
              />
            </FormField>
          )}
        />
      </div>
    </>
  );

  return (
    <>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-1">
        <BaseListingForm<EditSubletFormData>
          control={control}
          errors={errors}
          touchedFields={touchedFields as Partial<Record<keyof EditSubletFormData, boolean>>}
          disabled={isDisabled}
          displayLabel="Listing"
          exampleTitle="e.g., Spacious 2BR near campus"
          isSublet
          childrenAfterPrice={subletFieldsAfterPrice}
        />
      </div>
      <DialogFooter>
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => onSuccess()}
          type="button"
        >
          Cancel
        </Button>
        <Button
          className="cursor-pointer"
          onClick={handleSubmit((data) => editMutation.mutate(data))}
          disabled={isDisabled}
        >
          {editMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
};

export const EditListing = ({ listing, open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>Update your listing details below.</DialogDescription>
        </DialogHeader>
        {listing.listing_type === "item" ? (
          <EditItemContent
            listing={listing}
            open={open}
            onSuccess={() => onOpenChange(false)}
          />
        ) : (
          <EditSubletContent
            listing={listing}
            open={open}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
