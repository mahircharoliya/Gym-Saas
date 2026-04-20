"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Product } from "./page";

interface Props {
    product: Product | null;
    token: string;
    onClose: () => void;
    onSaved: () => void;
}

const MEMBERSHIP_TYPES = [
    { value: "FULL_ACCESS", label: "Full Access" },
    { value: "LIMITED_VISITS", label: "Limited Visits" },
    { value: "TIME_BASED", label: "Time Based" },
    { value: "CLASS_BASED", label: "Class Based" },
];

const BILLING_INTERVALS = [
    { value: "ONCE", label: "One-time" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
];

const DEFAULT_FORM = {
    name: "", description: "", membershipType: "FULL_ACCESS",
    price: "", comparePrice: "", billingInterval: "MONTHLY",
    visitLimit: "", durationDays: "", discountPercent: "", discountEndsAt: "",
};

export default function ProductModal({ product, token, onClose, onSaved }: Props) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                description: product.description ?? "",
                membershipType: product.membershipType,
                price: product.price,
                comparePrice: product.comparePrice ?? "",
                billingInterval: product.billingInterval,
                visitLimit: product.visitLimit?.toString() ?? "",
                durationDays: product.durationDays?.toString() ?? "",
                discountPercent: product.discountPercent ?? "",
                discountEndsAt: "",
            });
        }
    }, [product]);

    function set(key: string, value: string) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name || !form.price) return setError("Name and price are required.");

        const body = {
            ...form,
            price: parseFloat(form.price),
            comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
            visitLimit: form.visitLimit ? parseInt(form.visitLimit) : undefined,
            durationDays: form.durationDays ? parseInt(form.durationDays) : undefined,
            discountPercent: form.discountPercent ? parseFloat(form.discountPercent) : undefined,
            discountEndsAt: form.discountEndsAt || undefined,
        };

        setLoading(true);
        try {
            const url = product ? `/api/products/${product.id}` : "/api/products";
            const method = product ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error || "Something went wrong.");
            onSaved();
            onClose();
        } finally {
            setLoading(false);
        }
    }

    const showVisitLimit = form.membershipType === "LIMITED_VISITS";
    const showDuration = form.membershipType === "TIME_BASED";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <p className="font-semibold text-black">
                        {product ? "Edit Product" : "New Product"}
                    </p>
                    <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {error && (
                        <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <Input label="Product Name" placeholder="e.g. Monthly Unlimited" value={form.name}
                        onChange={(e) => set("name", e.target.value)} />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            rows={2}
                            placeholder="Optional description..."
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-white px-4 py-2.5 text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Membership Type</label>
                            <select value={form.membershipType} onChange={(e) => set("membershipType", e.target.value)}
                                className="rounded-lg border border-gray-700 bg-white px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500">
                                {MEMBERSHIP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Billing</label>
                            <select value={form.billingInterval} onChange={(e) => set("billingInterval", e.target.value)}
                                className="rounded-lg border border-gray-700 bg-white px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500">
                                {BILLING_INTERVALS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price ($)" type="number" step="0.01" placeholder="29.99"
                            value={form.price} onChange={(e) => set("price", e.target.value)} />
                        <Input label="Compare Price ($)" type="number" step="0.01" placeholder="49.99"
                            value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} />
                    </div>

                    {showVisitLimit && (
                        <Input label="Visit Limit" type="number" placeholder="e.g. 10"
                            value={form.visitLimit} onChange={(e) => set("visitLimit", e.target.value)} />
                    )}
                    {showDuration && (
                        <Input label="Duration (days)" type="number" placeholder="e.g. 30"
                            value={form.durationDays} onChange={(e) => set("durationDays", e.target.value)} />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Discount %" type="number" step="0.01" placeholder="10"
                            value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)} />
                        <Input label="Discount Ends" type="date"
                            value={form.discountEndsAt} onChange={(e) => set("discountEndsAt", e.target.value)} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} className="flex-1">
                            {product ? "Save Changes" : "Create Product"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

