"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
    Search, Upload, Trash2, UserCog, ChevronLeft,
    ChevronRight, UserPlus,
} from "lucide-react";

interface Member {
    id: string; email: string; firstName: string; lastName: string;
    phone?: string; role: string; createdAt: string;
    memberProducts: { id: string; product: { name: string } }[];
}

const ROLES = ["", "ADMIN", "MANAGER", "TRAINER", "MEMBER"];

export default function MembersPage() {
    const { token } = useAuth();
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    const [members, setMembers] = useState<Member[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importMsg, setImportMsg] = useState("");

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: String(page), limit: "20",
            ...(search ? { search } : {}),
            ...(roleFilter ? { role: roleFilter } : {}),
        });
        const res = await fetch(`/api/admin/members?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
            setMembers(json.data.users);
            setTotal(json.data.total);
            setPages(json.data.pages);
        }
        setLoading(false);
    }, [token, page, search, roleFilter]);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [search, roleFilter]);

    function toggleSelect(id: string) {
        setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    }

    function toggleAll() {
        setSelected(selected.length === members.length ? [] : members.map((m) => m.id));
    }

    async function bulkDelete() {
        if (!confirm(`Delete ${selected.length} member(s)?`)) return;
        await fetch("/api/admin/members/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: "delete", ids: selected }),
        });
        setSelected([]);
        fetchMembers();
    }

    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true); setImportMsg("");
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/members/import", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
        });
        const json = await res.json();
        if (res.ok) {
            setImportMsg(`Imported ${json.data.imported}, skipped ${json.data.skipped}`);
            fetchMembers();
        } else {
            setImportMsg(json.error ?? "Import failed.");
        }
        setImporting(false);
        e.target.value = "";
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-white">Members</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{total} total members</p>
                </div>
                <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
                    <Button variant="ghost" onClick={() => fileRef.current?.click()}
                        loading={importing} className="w-auto gap-2 px-3">
                        <Upload size={14} /> Import CSV
                    </Button>
                    <Button onClick={() => router.push("/dashboard/settings/team")}
                        className="w-auto gap-2 px-3">
                        <UserPlus size={14} /> Invite
                    </Button>
                </div>
            </div>

            {importMsg && (
                <p className="text-sm text-emerald-400">{importMsg}</p>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500">
                    {ROLES.map((r) => <option key={r} value={r}>{r || "All Roles"}</option>)}
                </select>
            </div>

            {/* Bulk actions */}
            {selected.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5">
                    <span className="text-sm text-gray-300">{selected.length} selected</span>
                    <button onClick={bulkDelete}
                        className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors ml-auto">
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left w-10">
                                <input type="checkbox"
                                    checked={selected.length === members.length && members.length > 0}
                                    onChange={toggleAll} className="accent-indigo-500" />
                            </th>
                            <th className="px-4 py-3 text-left">Member</th>
                            <th className="px-4 py-3 text-left hidden md:table-cell">Role</th>
                            <th className="px-4 py-3 text-left hidden lg:table-cell">Plan</th>
                            <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="py-12 text-center">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent inline-block" />
                            </td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                                No members found.
                            </td></tr>
                        ) : members.map((m) => (
                            <tr key={m.id}
                                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                                onClick={() => router.push(`/dashboard/members/${m.id}`)}>
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" checked={selected.includes(m.id)}
                                        onChange={() => toggleSelect(m.id)} className="accent-indigo-500" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400 shrink-0">
                                            {m.firstName[0]}{m.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{m.firstName} {m.lastName}</p>
                                            <p className="text-xs text-gray-500">{m.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300 capitalize">
                                        {m.role.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                                    {m.memberProducts[0]?.product.name ?? <span className="text-gray-600">—</span>}
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                                    {new Date(m.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => router.push(`/dashboard/members/${m.id}`)}
                                        className="text-gray-400 hover:text-white transition-colors p-1">
                                        <UserCog size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Page {page} of {pages}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800 disabled:opacity-40 transition-colors">
                            <ChevronLeft size={15} />
                        </button>
                        <button disabled={page === pages} onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border border-gray-700 p-2 hover:bg-gray-800 disabled:opacity-40 transition-colors">
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
