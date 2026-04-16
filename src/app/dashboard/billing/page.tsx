"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

interface Membership {
    id: string;
    status: string;
    activatedAt: string;
    expiresAt?: string;
    cancelledAt?: string;
    visitsRemaining?: number;
    product: {
        name: string;
        membershipType: string;
        price: string;
        billingInterval: string;
        visitLimit?: number;
        durationDays?: number;
    };
}

const STATUS_STYLES: Record<string, { color: string; icon: React.ElementType }> = {
    ACTIVE: { color: "text-emerald-400", icon: CheckCircle2 },
    CANCELLED: { color: "text-red-400", icon: XCircle },
    EXPIRED: { color: "text-gray-400", icon: Clock },
    PAUSED: { color: "text-yellow-400", icon: Clock },
};

const INTERVAL: Record<string, string> = {
    ONCE: "one-time", MONTHLY: "/mo", YEARLY: "/yr", WEEKLY: "/wk", DAILY: "/day",
};

export default function BillingPage() {
    const { token } = useAuth();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const fetchMemberships = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/member/memberships", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setMemberships(json.data);
        setLoading(false);
    }, [token]);

    useEffect(() => { fetchMemberships(); }, [fetchMemberships]);

    async function cancel(id: string) {
        if (!confirm("Cancel this membership? This cannot be undone.")) return;
        setCancelling(id);
        await fetch(`/api/member/memberships/${id}/cancel`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        setCancelling(null);
        fetchMemberships();
    }

    const active = memberships.filter((m) => m.status === "ACTIVE");
    const past = memberships.filter((m) => m.status !== "ACTIVE");

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Billing & Plans</h2>
                <p className="text-sm text-gray-400 mt-0.5">Manage your memberships and subscriptions.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
            ) : (
                <>
                    {/* Active plans */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            Active Plans
                        </p>
                        {active.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
                                <CreditCard size={28} className="mx-auto mb-2 text-gray-600" />
                                <p className="text-sm text-gray-400">No active memberships.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {active.map((m) => (
                                    <MembershipCard
                                        key={m.id} membership={m}
                                        onCancel={() => cancel(m.id)}
                                        cancelling={cancelling === m.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past plans */}
                    {past.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                                Past Plans
                            </p>
                            <div className="space-y-3">
                                {past.map((m) => (
                                    <MembershipCard key={m.id} membership={m} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function MembershipCard({
    membership: m, onCancel, cancelling,
}: {
    membership: Membership;
    onCancel?: () => void;
    cancelling?: boolean;
}) {
    const style = STATUS_STYLES[m.status] ?? STATUS_STYLES.EXPIRED;
    const Icon = style.icon;

    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white">{m.product.name}</p>
                        <span className={`flex items-center gap-1 text-xs ${style.color}`}>
                            <Icon size={12} /> {m.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">
                        ${Number(m.product.price).toFixed(2)}
                        <span className="text-gray-500"> {INTERVAL[m.product.billingInterval]}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>Started {new Date(m.activatedAt).toLocaleDateString()}</span>
                        {m.expiresAt && (
                            <span>Expires {new Date(m.expiresAt).toLocaleDateString()}</span>
                        )}
                        {m.visitsRemaining !== undefined && m.visitsRemaining !== null && (
                            <span className="text-indigo-400">{m.visitsRemaining} visits left</span>
                        )}
                        {m.cancelledAt && (
                            <span>Cancelled {new Date(m.cancelledAt).toLocaleDateString()}</span>
                        )}
                    </div>
                </div>
                {m.status === "ACTIVE" && onCancel && (
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        loading={cancelling}
                        className="w-auto px-3 py-1.5 text-xs text-red-400 border-red-900 hover:bg-red-900/20"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
}
