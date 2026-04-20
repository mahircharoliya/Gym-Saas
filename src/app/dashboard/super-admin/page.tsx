"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Search, LogIn, Building2 } from "lucide-react";
import Input from "@/components/ui/Input";

interface Tenant {
    id: string; name: string; slug: string; createdAt: string;
    _count: { users: number };
    users: { id: string; email: string; firstName: string; lastName: string }[];
}

export default function SuperAdminPage() {
    const { token, user, login } = useAuth();
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [loggingIn, setLoggingIn] = useState<string | null>(null);

    const fetchTenants = useCallback(async () => {
        setLoading(true);
        const params = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/super-admin/tenants${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setTenants(json.data);
        setLoading(false);
    }, [token, search]);

    useEffect(() => { fetchTenants(); }, [fetchTenants]);

    // Redirect non-super-admins
    useEffect(() => {
        if (user && user.role !== "SUPER_ADMIN") router.push("/dashboard");
    }, [user, router]);

    async function loginAs(userId: string) {
        setLoggingIn(userId);
        const res = await fetch("/api/super-admin/login-as", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId }),
        });
        const json = await res.json();
        if (res.ok) {
            login(json.data.token, json.data.user, json.data.tenant);
            router.push("/dashboard");
        }
        setLoggingIn(null);
    }

    if (user?.role !== "SUPER_ADMIN") return null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-black">Super Admin</h2>
                <p className="text-sm text-gray-400 mt-0.5">All gyms on the platform.</p>
            </div>

            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search gyms…"
                    className="w-full rounded-lg border border-gray-700 bg-white pl-9 pr-4 py-2.5 text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="rounded-xl border border-gray-800 bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">Gym</th>
                            <th className="px-4 py-3 text-left hidden md:table-cell">Admin</th>
                            <th className="px-4 py-3 text-left hidden lg:table-cell">Members</th>
                            <th className="px-4 py-3 text-left hidden lg:table-cell">Created</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="py-12 text-center">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent inline-block" />
                            </td></tr>
                        ) : tenants.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-gray-500">
                                No gyms found.
                            </td></tr>
                        ) : tenants.map((t) => (
                            <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 shrink-0">
                                            <Building2 size={14} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-black">{t.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{t.slug}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                                    {t.users[0] ? (
                                        <div>
                                            <p className="text-black">{t.users[0].firstName} {t.users[0].lastName}</p>
                                            <p className="text-gray-500">{t.users[0].email}</p>
                                        </div>
                                    ) : "—"}
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                                    {t._count.users}
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {t.users[0] && (
                                        <button
                                            onClick={() => loginAs(t.users[0].id)}
                                            disabled={loggingIn === t.users[0].id}
                                            className="flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-600/30 transition-colors ml-auto disabled:opacity-50">
                                            {loggingIn === t.users[0].id
                                                ? <span className="h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent" />
                                                : <LogIn size={12} />
                                            }
                                            Login As
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

