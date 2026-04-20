"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, Trash2, CheckCircle2, XCircle, Clock, Plus } from "lucide-react";

interface MemberDetail {
    id: string; email: string; firstName: string; lastName: string;
    phone?: string; role: string; createdAt: string;
    memberProducts: {
        id: string; status: string; activatedAt: string;
        expiresAt?: string; cancelledAt?: string; visitsRemaining?: number;
        product: { name: string; price: string; billingInterval: string; membershipType: string };
    }[];
    signedWaivers: {
        id: string; signedAt: string;
        waiver: { title: string };
    }[];
}

const ROLES = ["MEMBER", "TRAINER", "MANAGER", "ADMIN"];
const STATUS_ICON: Record<string, React.ElementType> = {
    ACTIVE: CheckCircle2, CANCELLED: XCircle, EXPIRED: Clock, PAUSED: Clock,
};
const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "text-emerald-400", CANCELLED: "text-red-400",
    EXPIRED: "text-gray-400", PAUSED: "text-yellow-400",
};

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token } = useAuth();
    const router = useRouter();

    const [member, setMember] = useState<MemberDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", role: "" });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
    const [addingProduct, setAddingProduct] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");

    useEffect(() => {
        fetch(`/api/admin/members/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    setMember(json.data);
                    setForm({
                        firstName: json.data.firstName,
                        lastName: json.data.lastName,
                        phone: json.data.phone ?? "",
                        role: json.data.role,
                    });
                }
            })
            .finally(() => setLoading(false));
        // Fetch available products
        fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((j) => { if (j.success) setProducts(j.data); });
    }, [id, token]);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setSuccess("");
        setSaving(true);
        const res = await fetch(`/api/admin/members/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) setError(json.error);
        else { setSuccess("Saved."); setMember((m) => m ? { ...m, ...json.data } : m); }
        setSaving(false);
    }

    async function cancelMembership(mpId: string) {
        if (!confirm("Cancel this membership?")) return;
        await fetch(`/api/member/memberships/${mpId}/cancel`, {
            method: "POST", headers: { Authorization: `Bearer ${token}` },
        });
        const res = await fetch(`/api/admin/members/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) setMember(json.data);
    }

    async function assignProduct() {
        if (!selectedProductId) return;
        setAddingProduct(true);
        const res = await fetch(`/api/admin/members/${id}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ productId: selectedProductId }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error); setAddingProduct(false); return; }
        setSelectedProductId("");
        const refresh = await fetch(`/api/admin/members/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const refreshJson = await refresh.json();
        if (refreshJson.success) setMember(refreshJson.data);
        setAddingProduct(false);
    }

    async function refundMembership(mpId: string) {
        const transactionId = prompt("Enter Authorize.net Transaction ID (leave blank to just cancel):");
        const amount = transactionId ? prompt("Refund amount:") : null;
        if (!confirm("Cancel and refund this membership?")) return;
        await fetch(`/api/admin/members/${id}/refund`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ memberProductId: mpId, transactionId, amount }),
        });
        const res = await fetch(`/api/admin/members/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (json.success) setMember(json.data);
    }

    async function deleteMember() {
        if (!confirm("Permanently delete this member?")) return;
        await fetch(`/api/admin/members/${id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/dashboard/members");
    }

    if (loading) return (
        <div className="flex justify-center py-20">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
    );

    if (!member) return (
        <div className="text-center py-20 text-gray-400">Member not found.</div>
    );

    return (
        <div className="max-w-3xl space-y-6">
            {/* Back + header */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.push("/dashboard/members")}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft size={16} /> Members
                </button>
                <button onClick={deleteMember}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 size={14} /> Delete Member
                </button>
            </div>

            {/* Avatar + info */}
            <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-white p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-black shrink-0">
                    {member.firstName[0]}{member.lastName[0]}
                </div>
                <div>
                    <p className="text-lg font-semibold text-black">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-gray-400">{member.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Joined {new Date(member.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
            </div>

            {/* Edit form */}
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <p className="text-sm font-medium text-black mb-4">Edit Info</p>
                {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
                {success && <p className="mb-3 text-sm text-emerald-400">{success}</p>}
                <form onSubmit={save} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" value={form.firstName}
                            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                        <Input label="Last Name" value={form.lastName}
                            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                    </div>
                    <Input label="Phone" value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Role</label>
                        <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                            className="rounded-lg border border-gray-700 bg-white px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500">
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <Button type="submit" loading={saving}>Save Changes</Button>
                </form>
            </div>

            {/* Memberships */}
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-black">Memberships</p>
                </div>

                {/* Assign product */}
                <div className="flex gap-2 mb-4">
                    <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-700 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select product to assign…</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Button onClick={assignProduct} loading={addingProduct} className="w-auto px-3 gap-1.5">
                        <Plus size={14} /> Assign
                    </Button>
                </div>

                {member.memberProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">No memberships.</p>
                ) : (
                    <div className="space-y-3">
                        {member.memberProducts.map((mp) => {
                            const Icon = STATUS_ICON[mp.status] ?? Clock;
                            const color = STATUS_COLOR[mp.status] ?? "text-gray-400";
                            return (
                                <div key={mp.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-black">{mp.product.name}</p>
                                            <span className={`flex items-center gap-1 text-xs ${color}`}>
                                                <Icon size={11} /> {mp.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            ${Number(mp.product.price).toFixed(2)} ·{" "}
                                            Started {new Date(mp.activatedAt).toLocaleDateString()}
                                            {mp.expiresAt && ` · Expires ${new Date(mp.expiresAt).toLocaleDateString()}`}
                                            {mp.visitsRemaining != null && ` · ${mp.visitsRemaining} visits left`}
                                        </p>
                                    </div>
                                    {mp.status === "ACTIVE" && (
                                        <div className="flex gap-3">
                                            <button onClick={() => cancelMembership(mp.id)}
                                                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                                                Cancel
                                            </button>
                                            <button onClick={() => refundMembership(mp.id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                                Refund
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Signed waivers */}
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <p className="text-sm font-medium text-black mb-4">Signed Waivers</p>
                {member.signedWaivers.length === 0 ? (
                    <p className="text-sm text-gray-500">No signed waivers.</p>
                ) : (
                    <ul className="space-y-2">
                        {member.signedWaivers.map((sw) => (
                            <li key={sw.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">{sw.waiver.title}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(sw.signedAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
