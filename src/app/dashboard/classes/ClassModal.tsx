"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Trainer { id: string; firstName: string; lastName: string }

interface Props {
    token: string;
    defaultStart: Date | null;
    onClose: () => void;
    onSaved: () => void;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toLocalInput(d: Date) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function ClassModal({ token, defaultStart, onClose, onSaved }: Props) {
    const now = defaultStart ?? new Date();
    const end = new Date(now.getTime() + 60 * 60000);

    const [form, setForm] = useState({
        name: "", description: "", location: "", color: "#6366f1",
        capacity: "20", trainerId: "",
        startAt: toLocalInput(now), endAt: toLocalInput(end),
        isRecurring: false, recurringDays: [now.getDay()], recurringWeeks: "4",
    });
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/admin/members?role=TRAINER&limit=50", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()).then((j) => { if (j.success) setTrainers(j.data.users); });
    }, [token]);

    function set(key: string, value: unknown) { setForm((f) => ({ ...f, [key]: value })); }

    function toggleDay(d: number) {
        setForm((f) => ({
            ...f,
            recurringDays: f.recurringDays.includes(d)
                ? f.recurringDays.filter((x) => x !== d)
                : [...f.recurringDays, d],
        }));
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name) return setError("Class name is required.");
        setLoading(true);
        try {
            const res = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    capacity: parseInt(form.capacity),
                    recurringWeeks: parseInt(form.recurringWeeks),
                    trainerId: form.trainerId || null,
                }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error);
            onSaved(); onClose();
        } finally { setLoading(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <p className="font-semibold text-white">New Class</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <form onSubmit={save} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <Input label="Class Name" placeholder="e.g. Morning Yoga" value={form.name}
                        onChange={(e) => set("name", e.target.value)} />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Start" type="datetime-local" value={form.startAt}
                            onChange={(e) => set("startAt", e.target.value)} />
                        <Input label="End" type="datetime-local" value={form.endAt}
                            onChange={(e) => set("endAt", e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Location" placeholder="Studio A" value={form.location}
                            onChange={(e) => set("location", e.target.value)} />
                        <Input label="Capacity" type="number" value={form.capacity}
                            onChange={(e) => set("capacity", e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Trainer</label>
                        <select value={form.trainerId} onChange={(e) => set("trainerId", e.target.value)}
                            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">No trainer assigned</option>
                            {trainers.map((t) => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Color picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300">Color</label>
                        <div className="flex gap-2">
                            {COLORS.map((c) => (
                                <button key={c} type="button" onClick={() => set("color", c)}
                                    className={`h-7 w-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}`}
                                    style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>

                    {/* Recurring */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.isRecurring}
                            onChange={(e) => set("isRecurring", e.target.checked)} className="accent-indigo-500" />
                        <span className="text-sm text-gray-300">Recurring class</span>
                    </label>

                    {form.isRecurring && (
                        <div className="space-y-3 rounded-lg border border-gray-700 p-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Repeat on days</p>
                                <div className="flex gap-2">
                                    {DAYS_OF_WEEK.map((d, i) => (
                                        <button key={i} type="button" onClick={() => toggleDay(i)}
                                            className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${form.recurringDays.includes(i)
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                }`}>
                                            {d[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Input label="Repeat for (weeks)" type="number" value={form.recurringWeeks}
                                onChange={(e) => set("recurringWeeks", e.target.value)} />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" loading={loading} className="flex-1">Create Class</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
