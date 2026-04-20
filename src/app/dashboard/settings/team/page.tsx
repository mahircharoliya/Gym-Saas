"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Trash2, Send } from "lucide-react";

const ROLES = ["MEMBER", "TRAINER", "MANAGER", "ADMIN"];

interface Invite {
    id: string;
    email: string;
    role: string;
    expiresAt: string;
    inviter: { firstName: string; lastName: string };
}

export default function TeamPage() {
    const { token } = useAuth();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("MEMBER");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchInvites = useCallback(async () => {
        const res = await fetch("/api/invites", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setInvites(json.data);
    }, [token]);

    useEffect(() => { fetchInvites(); }, [fetchInvites]);

    async function sendInvite(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setSuccess("");
        if (!email) return setError("Email is required.");
        setLoading(true);
        try {
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email, role }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error);
            setSuccess(`Invite sent to ${email}`);
            setEmail("");
            fetchInvites();
        } finally {
            setLoading(false);
        }
    }

    async function revokeInvite(id: string) {
        await fetch(`/api/invites/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchInvites();
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-black">Team & Invites</h2>
                <p className="text-sm text-gray-400 mt-1">Invite staff members to your gym.</p>
            </div>

            {/* Invite form */}
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <p className="text-sm font-medium text-black mb-4">Send Invite</p>
                {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
                {success && <p className="mb-3 text-sm text-emerald-400">{success}</p>}
                <form onSubmit={sendInvite} className="flex gap-3 items-end">
                    <div className="flex-1">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="trainer@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="rounded-lg border border-gray-700 bg-white px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" loading={loading} className="w-auto px-4 gap-2">
                        <Send size={14} /> Send
                    </Button>
                </form>
            </div>

            {/* Pending invites */}
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <p className="text-sm font-medium text-black mb-4">Pending Invites</p>
                {invites.length === 0 ? (
                    <p className="text-sm text-gray-500">No pending invites.</p>
                ) : (
                    <ul className="space-y-3">
                        {invites.map((inv) => (
                            <li key={inv.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-black">{inv.email}</p>
                                    <p className="text-xs text-gray-500">
                                        {inv.role} · invited by {inv.inviter.firstName}{" "}
                                        · expires {new Date(inv.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => revokeInvite(inv.id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

