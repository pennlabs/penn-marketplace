"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { FormField } from "@/components/common/FormField";
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";


const newListingSchema = z.object({
    productName: z.string().min(1, "Product name is required"),
    price: z.string().min(1, "Price is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    productType: z.string().min(1, "Product type is required"),
    quality: z.string().min(1, "Quality is required"),
    paymentMethods: z.string().min(1, "Payment methods are required"),
    deliveryMethod: z.string().min(1, "Delivery method is required"),
});

type NewListingFormData = z.infer<typeof newListingSchema>;

const PRODUCT_TYPE_OPTIONS = [
  { value: "physical", label: "Physical Item" },
  { value: "digital", label: "Digital Item" },
  { value: "service", label: "Service" },
];

const QUALITY_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "paypal", label: "PayPal" },
];

const DELIVERY_METHOD_OPTIONS = [
  { value: "pickup", label: "Local Pickup" },
  { value: "delivery", label: "Delivery" },
  { value: "shipping", label: "Shipping" },
];

export default function NewListing() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<NewListingFormData>({
    resolver: zodResolver(newListingSchema),
    mode: "onChange",
    defaultValues: {
      productName: "",
      price: "",
      description: "",
      category: "",
      productType: "",
      quality: "",
      paymentMethods: "",
      deliveryMethod: "",
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

  const onSubmit = async (data: NewListingFormData) => {
    // TODO: Implement actual submission logic
    console.log("Form data:", data);
    console.log("Images:", images);

    router.push("/new-listing/success");
  };

  return (
    <div className="w-full mx-auto container max-w-[96rem] px-12 pt-6 pb-12">
      <Link href="/new-listing">
        <Button variant="secondary" size="sm" className="mb-4">
          Back
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">New Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Controller
              name="productName"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Product Name"
                  error={errors.productName?.message}
                  touched={touchedFields.productName}
                >
                  <Input
                    {...field}
                    placeholder="Enter Product Name"
                    aria-invalid={!!errors.productName}
                  />
                </FormField>
              )}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Price"
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
                      className="pl-7"
                      aria-invalid={!!errors.price}
                    />
                  </div>
                </FormField>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Item Description"
                  error={errors.description?.message}
                  touched={touchedFields.description}
                >
                  <Textarea
                    {...field}
                    placeholder="Enter Description (size, details, etc.)"
                    className="min-h-[100px]"
                    aria-invalid={!!errors.description}
                  />
                </FormField>
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Product Category"
                  error={errors.category?.message}
                  touched={touchedFields.category}
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.category}
                    >
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

            <Controller
              name="productType"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Product Type"
                  error={errors.productType?.message}
                  touched={touchedFields.productType}
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.productType}
                    >
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPE_OPTIONS.map((option) => (
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
              name="quality"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Quality"
                  error={errors.quality?.message}
                  touched={touchedFields.quality}
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.quality}
                    >
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_OPTIONS.map((option) => (
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
              name="paymentMethods"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Accepted Payment Method(s)"
                  error={errors.paymentMethods?.message}
                  touched={touchedFields.paymentMethods}
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.paymentMethods}
                    >
                      <SelectValue placeholder="Select Accepted Payment Method(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
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
              name="deliveryMethod"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Preferred Delivery Method"
                  error={errors.deliveryMethod?.message}
                  touched={touchedFields.deliveryMethod}
                >
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!errors.deliveryMethod}
                    >
                      <SelectValue placeholder="Select Delivery Method(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_METHOD_OPTIONS.map((option) => (
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

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2">
                Product Media
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
                  <p className="text-xs text-gray-400">
                    Supports: PNG, JPG, HEIC
                  </p>
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

            <div className="space-y-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-700"
                onClick={() => router.push("/new-listing")}
              >
                Cancel Listing
              </Button>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
