"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { marketplaceAPI } from "@/lib/api";

export default function CreateItemPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        externalLink: "",
        price: "",
        negotiable: true,
        category: "",
        expiresAt: "",
    });

    const createItemMutation = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: (data: any) => marketplaceAPI.createItem(data),
        onSuccess: () => {
            alert("Item created successfully!");
            router.push("/"); // redirect to home or item detail page
        },
        onError: (error) => {
            alert(`Error creating item: ${error.message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data according to backend serializer expectations
        const itemData = {
            title: formData.title,
            description: formData.description,
            external_link: formData.externalLink || null,
            price: parseFloat(formData.price),
            negotiable: formData.negotiable,
            category: formData.category,
            expires_at: formData.expiresAt,
        };

        createItemMutation.mutate(itemData);
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
            <h1 className="text-3xl font-bold mb-8">Create Item Listing</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="e.g., iPhone 13 Pro"
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
                        placeholder="Describe your item..."
                    />
                </div>

                <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-2">
                        Price ($) *
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
                        <option value="electronics">Electronics</option>
                        <option value="furniture">Furniture</option>
                        <option value="textbooks">Textbooks</option>
                        <option value="clothing">Clothing</option>
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
                        Expires At *
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

                <div className="flex items-center text-sm font-medium">
                    *Required field
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={createItemMutation.isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {createItemMutation.isPending ? "Creating..." : "Create Listing"}
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

