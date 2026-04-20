"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const TIMEZONES = [
    "America/New_York", "America/Chicago", "America/Denver",
    "America/Los_Angeles", "America/Phoenix", "America/Anchorage",
    "Pacific/Honolulu", "Europe/London", "Europe/Paris",
    "Europe/Berlin", "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney",
];

interface TenantSettings {
    name: string; slug: string; domain: string; logoUrl: string;
    address: string; phone: string; email: string; timezone: string;
    emailNotifications: boolean; smsNotifications: boolean;
}

const EMPTY: TenantSettings = {
    name: "", slug: "", domain: "", logoUrl: "", address: "",
    phone: "", email: "", timezone: "America/New_York",
    emailNotifications: true, smsNotifications: false,
};

export default function GeneralSettingsPage() {
    const { token, login, user } = useAuth();
    const [form, setForm] = useState<TenantSettings>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    const d = json.data;
                    setForm({
                        name: d.name ?? "",
                        slug: d.slug ?? "",
                        domain: d.domain ?? "",
                        logoUrl: d.logoUrl ?? "",
                        address: d.address ?? "",
                        phone: d.phone ?? "",
                        email: d.email ?? "",
                        timezone: d.timezone ?? "America/New_York",
                        emailNotifications: d.emailNotifications ?? true,
                        smsNotifications: d.smsNotifications ?? false,
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    function set(key: keyof TenantSettings, value: string | boolean) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setSuccess("");
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error);
            // Update tenant name in auth context
            login(token!, user!, { id: json.data.id, name: json.data.name, slug: json.data.slug });
            setSuccess("Settings saved.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex justify-center py-12">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
    );

    return (
        <form onSubmit={save} className="max-w-2xl space-y-6">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            {/* Gym info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                <p className="text-sm font-semibold text-black">Gym Information</p>
                <Input label="Gym Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                            <span className="text-slate-400 shrink-0">thinkauric.com/</span>
                            <span className="text-black">{form.slug}</span>
                        </div>
                    </div>
                    <Input label="Custom Domain" placeholder="gym.yourdomain.com"
                        value={form.domain} onChange={(e) => set("domain", e.target.value)} />
                </div>
                <Input label="Logo URL" placeholder="https://..."
                    value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} />
                <Input label="Address" placeholder="123 Main St, City, State"
                    value={form.address} onChange={(e) => set("address", e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Phone" type="tel" placeholder="+1 555 000 0000"
                        value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    <Input label="Contact Email" type="email" placeholder="info@yourgym.com"
                        value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</label>
                    <select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
                <p className="text-sm font-semibold text-black">Notifications</p>
                <Toggle
                    label="Email Notifications"
                    description="Send booking confirmations and reminders via email"
                    checked={form.emailNotifications}
                    onChange={(v) => set("emailNotifications", v)}
                />
                <Toggle
                    label="SMS Notifications"
                    description="Send booking reminders via SMS (requires Twilio setup)"
                    checked={form.smsNotifications}
                    onChange={(v) => set("smsNotifications", v)}
                />
            </div>

            <Button type="submit" loading={saving} className="w-auto px-8">
                Save Settings
            </Button>
        </form>
    );
}

function Toggle({
    label, description, checked, onChange,
}: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
                <p className="text-sm text-black">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-200"
                    }`}
            >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"
                    }`} />
            </button>
        </label>
    );
}

