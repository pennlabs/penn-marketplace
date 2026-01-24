"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/common/FormField";
import { BEDS_OPTIONS, BATHS_OPTIONS } from "@/lib/constants";
import { createListing } from "@/lib/actions";
import { createSubletSchema, type CreateSubletFormData } from "@/lib/validations";

export default function CreateSubletPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<CreateSubletFormData>({
    resolver: zodResolver(createSubletSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      price: "",
      description: "",
      negotiable: false,
      expires_at: "",
      external_link: "",
      tags: [],
      address: "",
      beds: "",
      baths: "",
      start_date: "",
      end_date: "",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: createListing,
    onSuccess: (data) => {
      toast.success("Sublet listing created successfully!");
      queryClient.invalidateQueries({ queryKey: ["sublets"] });
      router.push(`/sublets/${data.id}`);
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

  const onSubmit = (data: CreateSubletFormData) => {
    createListingMutation.mutate({
      title: data.title,
      description: data.description,
      price: data.price,
      negotiable: data.negotiable,
      expires_at: new Date(data.expires_at).toISOString(),
      external_link: data.external_link || undefined,
      tags: data.tags,
      listing_type: "sublet",
      additional_data: {
        address: data.address,
        beds: parseInt(data.beds),
        baths: parseInt(data.baths),
        start_date: data.start_date,
        end_date: data.end_date,
      },
    });
  };

  const isLoading = createListingMutation.isPending;

  return (
    <div className="w-full mx-auto container max-w-[96rem] px-12 pt-6 pb-12">
      <Link href="/create">
        <Button variant="secondary" size="sm" className="mb-4">
          Back
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">New Sublet Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Fields */}
          <div className="space-y-6">
            {/* Title */}
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Listing Title"
                  error={errors.title?.message}
                  touched={touchedFields.title}
                >
                  <Input
                    {...field}
                    placeholder="e.g., Spacious 2BR near campus"
                    aria-invalid={!!errors.title}
                  />
                </FormField>
              )}
            />

            {/* Price */}
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Monthly Rent"
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      /mo
                    </span>
                  </div>
                </FormField>
              )}
            />

            {/* Address */}
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

            {/* Beds and Baths */}
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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

            {/* Start and End Date */}
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

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Description"
                  error={errors.description?.message}
                  touched={touchedFields.description}
                >
                  <Textarea
                    {...field}
                    placeholder="Describe the sublet (amenities, location details, etc.)"
                    className="min-h-[100px]"
                    aria-invalid={!!errors.description}
                  />
                </FormField>
              )}
            />

            {/* Expiration Date */}
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

            {/* Negotiable */}
            <Controller
              name="negotiable"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="negotiable"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    htmlFor="negotiable"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Price is negotiable
                  </label>
                </div>
              )}
            />

            {/* External Link */}
            <Controller
              name="external_link"
              control={control}
              render={({ field }) => (
                <FormField
                  label="External Link"
                  error={errors.external_link?.message}
                  touched={touchedFields.external_link}
                  optional
                >
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://example.com"
                    aria-invalid={!!errors.external_link}
                  />
                </FormField>
              )}
            />
          </div>

          {/* Right Column - Image Upload and Buttons */}
          <div className="space-y-6">
            {/* Product Media */}
            <div>
              <label className="text-sm font-medium block mb-2">Property Photos</label>
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
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          {image.name.slice(0, 8)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-700"
                onClick={() => router.push("/create")}
                disabled={isLoading}
              >
                Cancel Listing
              </Button>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}