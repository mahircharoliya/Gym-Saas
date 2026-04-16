"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function NotificationsPage() {
    const { token } = useAuth();
    const [prefs, setPrefs] = useState({ emailReminders: true, smsReminders: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetch("/api/member/notifications", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((j) => { if (j.success) setPrefs(j.data); })
            .finally(() => setLoading(false));
    }, [token]);

    async function save() {
        setSaving(true); setSuccess("");
        const res = await fetch("/api/member/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(prefs),
        });
        if (res.ok) setSuccess("Preferences saved.");
        setSaving(false);
    }

    if (loading) return (
        <div className="flex justify-center py-12">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
    );

    return (
        <div className="max-w-md space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
                <p className="text-sm font-medium text-white">Class Reminders</p>
                {success && <p className="text-sm text-emerald-400">{success}</p>}

                <Toggle
                    label="Email Reminders"
                    description="Receive email reminders 24 hours before your booked classes"
                    checked={prefs.emailReminders}
                    onChange={(v) => setPrefs((p) => ({ ...p, emailReminders: v }))}
                />
                <Toggle
                    label="SMS Reminders"
                    description="Receive SMS reminders 24 hours before your booked classes"
                    checked={prefs.smsReminders}
                    onChange={(v) => setPrefs((p) => ({ ...p, smsReminders: v }))}
                />

                <Button onClick={save} loading={saving}>Save Preferences</Button>
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
                <p className="text-sm text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <button type="button" onClick={() => onChange(!checked)}
                className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-700"}`}>
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
            </button>
        </label>
    );
}
