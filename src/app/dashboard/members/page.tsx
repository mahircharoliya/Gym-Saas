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
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importMsg, setImportMsg] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        const orderBy = sortBy === "name" ? "firstName" : sortBy === "oldest" ? "createdAt_asc" : "createdAt_desc";
        const params = new URLSearchParams({
            page: String(page), limit: "20",
            ...(search ? { search } : {}),
            ...(roleFilter ? { role: roleFilter } : {}),
            ...(orderBy ? { orderBy } : {}),
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
    }, [token, page, search, roleFilter, sortBy]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMembers();
    }, [fetchMembers]);

    // Reset page on filter change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [search, roleFilter, sortBy]);

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
                    <h2 className="text-lg font-semibold text-black">Members</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{total} total members</p>
                </div>
                <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
                    <Button variant="ghost" onClick={() => fileRef.current?.click()}
                        loading={importing} className="w-auto gap-2 px-3">
                        <Upload size={14} /> Import CSV
                    </Button>
                    <Button variant="ghost" onClick={() => setShowAddModal(true)} className="w-auto gap-2 px-3">
                        <UserPlus size={14} /> Add Member
                    </Button>
                    <Button onClick={() => router.push("/dashboard/settings/team")}
                        className="w-auto gap-2 px-3">
                        <UserPlus size={14} /> Invite
                    </Button>
                </div>
            </div>

            {importMsg && (
                <p className="text-sm text-emerald-600">{importMsg}</p>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-black placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    {ROLES.map((r) => <option key={r} value={r}>{r || "All Roles"}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A–Z</option>
                </select>
            </div>

            {/* Bulk actions */}
            {selected.length > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
                    <span className="text-sm text-blue-700 font-medium">{selected.length} selected</span>
                    <button onClick={bulkDelete}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors ml-auto">
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider bg-slate-50">
                            <th className="px-4 py-3 text-left w-10">
                                <input type="checkbox"
                                    checked={selected.length === members.length && members.length > 0}
                                    onChange={toggleAll} className="accent-blue-500" />
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
                            <tr><td colSpan={6} className="py-16 text-center">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent inline-block" />
                            </td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                                No members found.
                            </td></tr>
                        ) : members.map((m) => (
                            <tr key={m.id}
                                className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/dashboard/members/${m.id}`)}>
                                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" checked={selected.includes(m.id)}
                                        onChange={() => toggleSelect(m.id)} className="accent-blue-500" />
                                </td>
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 shrink-0 border border-blue-100">
                                            {m.firstName[0]}{m.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-black">{m.firstName} {m.lastName}</p>
                                            <p className="text-xs text-slate-400">{m.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 hidden md:table-cell">
                                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 capitalize">
                                        {m.role.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                                    {m.memberProducts[0]?.product.name ?? <span className="text-slate-300">—</span>}
                                </td>
                                <td className="px-4 py-3.5 hidden lg:table-cell text-slate-400 text-xs">
                                    {new Date(m.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => router.push(`/dashboard/members/${m.id}`)}
                                        className="text-slate-400 hover:text-black transition-colors p-1 rounded-lg hover:bg-slate-100">
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
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Page {page} of {pages}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                            <ChevronLeft size={15} />
                        </button>
                        <button disabled={page === pages} onClick={() => setPage((p) => p + 1)}
                            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-30 transition-colors">
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}

            {showAddModal && (
                <AddMemberModal
                    token={token!}
                    onClose={() => setShowAddModal(false)}
                    onSaved={fetchMembers}
                />
            )}
        </div>
    );
}

interface AddMemberModalProps { token: string; onClose: () => void; onSaved: () => void }

function AddMemberModal({ token, onClose, onSaved }: AddMemberModalProps) {
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "MEMBER", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.firstName || !form.lastName || !form.email || !form.password)
            return setError("First name, last name, email and password are required.");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/members", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error ?? "Failed to create member.");
            onSaved(); onClose();
        } finally { setLoading(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
                <p className="font-semibold text-black">Add Member</p>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <form onSubmit={save} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="First Name" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
                        <Input label="Last Name" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                    <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                    <Input label="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                    <Input label="Temp Password" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
                        <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                            {["MEMBER", "TRAINER", "MANAGER", "ADMIN"].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" type="button" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" loading={loading} className="flex-1">Add Member</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

