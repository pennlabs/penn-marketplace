"use client";

import Link from "next/link";

export default function CreatePage() {
    return (
        <div className="min-h-screen p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Create a Listing</h1>

            <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                    What type of listing would you like to create?
                </p>

                <Link
                    href="/create/item"
                    className="block p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                    <h2 className="text-xl font-semibold mb-2">Item Listing</h2>
                    <p className="text-gray-600">
                        Sell textbooks, furniture, electronics, and more
                    </p>
                </Link>

                <Link
                    href="/create/sublet"
                    className="block p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                    <h2 className="text-xl font-semibold mb-2">Sublet Listing</h2>
                    <p className="text-gray-600">
                        List your apartment or room for subletting
                    </p>
                </Link>
            </div>
        </div>
    );
}

