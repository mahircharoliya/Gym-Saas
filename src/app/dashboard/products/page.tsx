"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import ProductModal from "./ProductModal";
import { Plus, Pencil, Archive, Tag } from "lucide-react";

export interface Product {
    id: string;
    name: string;
    description?: string;
    membershipType: string;
    price: string;
    comparePrice?: string;
    billingInterval: string;
    visitLimit?: number;
    durationDays?: number;
    discountPercent?: string;
    status: string;
}

const TYPE_LABELS: Record<string, string> = {
    FULL_ACCESS: "Full Access",
    LIMITED_VISITS: "Limited Visits",
    TIME_BASED: "Time Based",
    CLASS_BASED: "Class Based",
};

const INTERVAL_LABELS: Record<string, string> = {
    ONCE: "One-time",
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};

export default function ProductsPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/products", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setProducts(json.data);
        setLoading(false);
    }, [token]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProducts();
    }, [fetchProducts]);

    async function archive(id: string) {
        if (!confirm("Archive this product?")) return;
        await fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
    }

    function openCreate() { setEditing(null); setModalOpen(true); }
    function openEdit(p: Product) { setEditing(p); setModalOpen(true); }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-black">Products</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Manage memberships and plans.</p>
                </div>
                <Button onClick={openCreate} className="w-auto gap-2 px-4">
                    <Plus size={15} /> New Product
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
                    <Tag size={32} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-sm text-gray-400">No products yet. Create your first membership plan.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => (
                        <div key={p.id} className="rounded-xl border border-gray-800 bg-white p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-medium text-black">{p.name}</p>
                                    {p.description && (
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
                                    )}
                                </div>
                                <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                                    {TYPE_LABELS[p.membershipType] ?? p.membershipType}
                                </span>
                            </div>

                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-black">${Number(p.price).toFixed(2)}</span>
                                {p.comparePrice && (
                                    <span className="text-sm text-gray-500 line-through mb-0.5">
                                        ${Number(p.comparePrice).toFixed(2)}
                                    </span>
                                )}
                                <span className="text-xs text-gray-500 mb-0.5">
                                    / {INTERVAL_LABELS[p.billingInterval]}
                                </span>
                            </div>

                            <div className="flex gap-1.5 text-xs text-gray-500">
                                {p.visitLimit && <span>{p.visitLimit} visits</span>}
                                {p.durationDays && <span>{p.durationDays} days</span>}
                                {p.discountPercent && (
                                    <span className="text-emerald-400">{p.discountPercent}% off</span>
                                )}
                            </div>

                            <div className="flex gap-2 mt-auto pt-2 border-t border-gray-800">
                                <button
                                    onClick={() => openEdit(p)}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors"
                                >
                                    <Pencil size={13} /> Edit
                                </button>
                                <button
                                    onClick={() => archive(p.id)}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors ml-auto"
                                >
                                    <Archive size={13} /> Archive
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <ProductModal
                    product={editing}
                    token={token!}
                    onClose={() => setModalOpen(false)}
                    onSaved={fetchProducts}
                />
            )}
        </div>
    );
}

