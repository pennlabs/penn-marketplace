"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { marketplaceAPI } from "@/lib/api";

export default function CreateSubletPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Item fields
    title: "",
    description: "",
    price: "",
    category: "",
    externalLink: "",
    negotiable: true,
    expiresAt: "",
    // Sublet specific fields
    address: "",
    beds: "",
    baths: "",
    startDate: "",
    endDate: "",
  });

  const createSubletMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => marketplaceAPI.createSublet(data),
    onSuccess: () => {
      alert("Sublet created successfully!");
      router.push("/"); // redirect to home or sublet detail page
    },
    onError: (error) => {
      alert(`Error creating sublet: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data according to backend serializer expectations
    // SubletSerializer expects nested item data
    const subletData = {
      item: {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        external_link: formData.externalLink || null,
        negotiable: formData.negotiable,
        expires_at: formData.expiresAt,
      },
      address: formData.address,
      beds: parseFloat(formData.beds),
      baths: parseFloat(formData.baths),
      start_date: formData.startDate,
      end_date: formData.endDate,
    };

    createSubletMutation.mutate(subletData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create Sublet Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Spacious 2BR near campus"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Describe your sublet..."
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Monthly Rent ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="negotiable"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="negotiable" className="text-sm font-medium">
                Price is negotiable
              </label>
            </div>
          </div>
        </div>

        {/* Sublet Details */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Sublet Details</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="123 Main St, Philadelphia, PA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  required
                  step="0.5"
                  min="0"
                  value={formData.beds}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-medium mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  required
                  step="0.5"
                  min="0"
                  value={formData.baths}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a category</option>
                <option value="sublet">Sublet</option>
                <option value="apartment">Apartment</option>
                <option value="room">Room</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="externalLink" className="block text-sm font-medium mb-2">
                External Link
              </label>
              <input
                type="url"
                id="externalLink"
                name="externalLink"
                value={formData.externalLink}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://..."
              />
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium mb-2">
                Listing Expires At *
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                required
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={createSubletMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {createSubletMutation.isPending ? "Creating..." : "Create Listing"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

