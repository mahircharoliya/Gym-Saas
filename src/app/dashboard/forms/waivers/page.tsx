"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { renderWaiver } from "@/lib/waiver";

interface Waiver { id: string; title: string; body: string; isActive: boolean }

const TOKENS = ["{{first_name}}", "{{last_name}}", "{{date}}"];

const DEFAULT_BODY = `I, {{first_name}} {{last_name}}, hereby acknowledge and agree to the terms of this waiver on {{date}}.

By signing below, I understand the risks involved and release the gym from any liability.`;

export default function WaiversPage() {
    const { token } = useAuth();
    const [waivers, setWaivers] = useState<Waiver[]>([]);
    const [editing, setEditing] = useState<Waiver | null>(null);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState(DEFAULT_BODY);
    const [preview, setPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchWaivers = useCallback(async () => {
        const res = await fetch("/api/waivers", { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (res.ok) setWaivers(json.data);
    }, [token]);

    useEffect(() => { fetchWaivers(); }, [fetchWaivers]);

    function openCreate() {
        setEditing(null); setTitle(""); setBody(DEFAULT_BODY);
        setPreview(false); setError(""); setCreating(true);
    }

    function openEdit(w: Waiver) {
        setEditing(w); setTitle(w.title); setBody(w.body);
        setPreview(false); setError(""); setCreating(true);
    }

    function insertToken(t: string) {
        setBody((b) => b + t);
    }

    async function save() {
        setError("");
        if (!title || !body) return setError("Title and body are required.");
        setLoading(true);
        try {
            const url = editing ? `/api/waivers/${editing.id}` : "/api/waivers";
            const method = editing ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, body }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error);
            setCreating(false);
            fetchWaivers();
        } finally {
            setLoading(false);
        }
    }

    async function deleteWaiver(id: string) {
        if (!confirm("Delete this waiver?")) return;
        await fetch(`/api/waivers/${id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${token}` },
        });
        fetchWaivers();
    }

    if (creating) {
        return (
            <div className="max-w-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        {editing ? "Edit Waiver" : "New Waiver"}
                    </h2>
                    <button onClick={() => setCreating(false)} className="text-sm text-gray-400 hover:text-white">
                        ← Back
                    </button>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Input label="Waiver Title" placeholder="Liability Waiver" value={title}
                    onChange={(e) => setTitle(e.target.value)} />

                {/* Token insert buttons */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Insert token:</span>
                    {TOKENS.map((t) => (
                        <button key={t} onClick={() => insertToken(t)}
                            className="rounded bg-gray-800 px-2 py-1 text-xs text-indigo-400 hover:bg-gray-700 transition-colors font-mono">
                            {t}
                        </button>
                    ))}
                </div>

                {/* Editor / Preview toggle */}
                <div className="flex gap-2">
                    <button onClick={() => setPreview(false)}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${!preview ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
                        Editor
                    </button>
                    <button onClick={() => setPreview(true)}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${preview ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>
                        Preview
                    </button>
                </div>

                {preview ? (
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {renderWaiver(body, { firstName: "John", lastName: "Doe" })}
                    </div>
                ) : (
                    <textarea
                        rows={14}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                    />
                )}

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setCreating(false)} className="flex-1">Cancel</Button>
                    <Button onClick={save} loading={loading} className="flex-1">
                        {editing ? "Save Changes" : "Create Waiver"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Waivers</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Build and manage liability waivers.</p>
                </div>
                <Button onClick={openCreate} className="w-auto gap-2 px-4">
                    <Plus size={15} /> New Waiver
                </Button>
            </div>

            {waivers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
                    <FileText size={32} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-sm text-gray-400">No waivers yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {waivers.map((w) => (
                        <div key={w.id} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-5 py-4">
                            <div>
                                <p className="text-sm font-medium text-white">{w.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{w.body.slice(0, 80)}…</p>
                            </div>
                            <div className="flex gap-3 ml-4">
                                <button onClick={() => openEdit(w)} className="text-gray-400 hover:text-white transition-colors">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => deleteWaiver(w.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
