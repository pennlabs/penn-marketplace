"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/common/FormField";
import {
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  BEDS_OPTIONS,
  BATHS_OPTIONS,
} from "@/lib/constants";
import { createListing } from "@/lib/actions";
import { createItemSchema, createSubletSchema } from "@/lib/validations";
import type { CreateItemPayload, CreateSubletPayload } from "@/lib/types";

type ListingType = "item" | "sublet";

type ListingFormProps = {
  listingType: ListingType;
};

const config = {
  item: {
    schema: createItemSchema,
    labels: {
      title: "Product Name",
      titlePlaceholder: "Enter Product Name",
      price: "Price",
      description: "Item Description",
      descriptionPlaceholder: "Enter Description (size, details, etc.)",
      media: "Product Media",
    },
    successMessage: "Listing created successfully!",
    queryKey: "items",
    redirectPath: "/items",
  },
  sublet: {
    schema: createSubletSchema,
    labels: {
      title: "Listing Title",
      titlePlaceholder: "e.g., Spacious 2BR near campus",
      price: "Monthly Rent",
      description: "Description",
      descriptionPlaceholder: "Describe the sublet (amenities, location details, etc.)",
      media: "Property Photos",
    },
    successMessage: "Sublet listing created successfully!",
    queryKey: "sublets",
    redirectPath: "/sublets",
  },
} as const;

// Combined form values type for internal use
type FormValues = {
  title: string;
  price: string;
  description: string;
  negotiable: boolean;
  expires_at: string;
  external_link: string;
  tags: string[];
  // Item-specific
  condition?: string;
  category?: string;
  // Sublet-specific
  address?: string;
  beds?: number;
  baths?: number;
  start_date?: string;
  end_date?: string;
};

export function ListingForm({ listingType }: ListingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const isItem = listingType === "item";
  const currentConfig = config[listingType];

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<FormValues>({
    resolver: zodResolver(currentConfig.schema) as any,
    mode: "onChange",
    defaultValues: {
      title: "",
      price: "",
      description: "",
      negotiable: false,
      expires_at: "",
      external_link: "",
      tags: [],
      ...(isItem && { condition: "", category: "" }),
      ...(!isItem && { address: "", beds: 0, baths: 0, start_date: "", end_date: "" }),
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createListing,
    onSuccess: (data) => {
      toast.success(currentConfig.successMessage);
      queryClient.invalidateQueries({ queryKey: [currentConfig.queryKey] });
      router.push(`${currentConfig.redirectPath}/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create listing");
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...droppedFiles].slice(0, 10));
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).filter((file) =>
          file.type.startsWith("image/")
        );
        setImages((prev) => [...prev, ...selectedFiles].slice(0, 10));
      }
    },
    []
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = (data: any) => {
    const basePayload = {
      title: data.title,
      description: data.description,
      price: String(data.price),
      negotiable: data.negotiable,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : "",
      external_link: data.external_link || undefined,
      tags: data.tags,
    };

    const payload = isItem
      ? ({
          ...basePayload,
          listing_type: "item",
          additional_data: {
            condition: data.condition,
            category: data.category,
          },
        } as CreateItemPayload)
      : ({
          ...basePayload,
          listing_type: "sublet",
          additional_data: {
            address: data.address,
            beds: data.beds,
            baths: data.baths,
            start_date: data.start_date,
            end_date: data.end_date,
          },
        } as CreateSubletPayload);

    mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <FormField
                label={currentConfig.labels.title}
                error={errors.title?.message}
                touched={touchedFields.title}
              >
                <Input
                  {...field}
                  placeholder={currentConfig.labels.titlePlaceholder}
                  aria-invalid={!!errors.title}
                />
              </FormField>
            )}
          />

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <FormField
                label={currentConfig.labels.price}
                error={errors.price?.message}
                touched={touchedFields.price}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    aria-invalid={!!errors.price}
                  />
                  {!isItem && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      /mo
                    </span>
                  )}
                </div>
              </FormField>
            )}
          />

          {/* Sublet-specific: Address */}
          {!isItem && (
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Address"
                  error={errors.address?.message}
                  touched={touchedFields.address}
                >
                  <Input
                    {...field}
                    placeholder="123 Main St, Philadelphia, PA 19104"
                    aria-invalid={!!errors.address}
                  />
                </FormField>
              )}
            />
          )}

          {/* Sublet-specific: Beds and Baths */}
          {!isItem && (
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="beds"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Bedrooms"
                    error={errors.beds?.message}
                    touched={touchedFields.beds}
                  >
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="w-full" aria-invalid={!!errors.beds}>
                        <SelectValue placeholder="Beds" />
                      </SelectTrigger>
                      <SelectContent>
                        {BEDS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                name="baths"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Bathrooms"
                    error={errors.baths?.message}
                    touched={touchedFields.baths}
                  >
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="w-full" aria-invalid={!!errors.baths}>
                        <SelectValue placeholder="Baths" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATHS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
            </div>
          )}

          {/* Sublet-specific: Start and End Date */}
          {!isItem && (
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
                    />
                  </FormField>
                )}
              />
            </div>
          )}

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <FormField
                label={currentConfig.labels.description}
                error={errors.description?.message}
                touched={touchedFields.description}
              >
                <Textarea
                  {...field}
                  placeholder={currentConfig.labels.descriptionPlaceholder}
                  className="min-h-[100px]"
                  aria-invalid={!!errors.description}
                />
              </FormField>
            )}
          />

          {/* Item-specific: Category */}
          {isItem && (
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Product Category"
                  error={errors.category?.message}
                  touched={touchedFields.category}
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          )}

          {/* Item-specific: Condition */}
          {isItem && (
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Condition"
                  error={errors.condition?.message}
                  touched={touchedFields.condition}
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={!!errors.condition}>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          )}

          <Controller
            name="expires_at"
            control={control}
            render={({ field }) => (
              <FormField
                label="Listing Expiration Date"
                error={errors.expires_at?.message}
                touched={touchedFields.expires_at}
              >
                <Input
                  {...field}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  aria-invalid={!!errors.expires_at}
                />
              </FormField>
            )}
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">
              {currentConfig.labels.media}
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-blue-400 bg-blue-50/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center min-h-[250px]">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-1">
                  Drop your images here or{" "}
                  <label className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
                    browse computer
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/heic"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-400">Insert up to 10 images</p>
                <p className="text-xs text-gray-400">Supports: PNG, JPG, HEIC</p>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        {image.name.slice(0, 8)}...
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
