"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordPage() {
    const { token } = useAuth();
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    function field(key: keyof typeof form) {
        return {
            value: form[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value })),
        };
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setError(""); setSuccess("");
        setLoading(true);
        try {
            const res = await fetch("/api/settings/password", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error);
            setSuccess("Password updated successfully.");
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md">
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <p className="text-sm font-medium text-black mb-4">Change Password</p>
                {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
                {success && <p className="mb-4 text-sm text-emerald-400">{success}</p>}

                <form onSubmit={save} className="space-y-4">
                    <PasswordField label="Current Password" showKey="current"
                        show={show.current} onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
                        {...field("currentPassword")} />
                    <PasswordField label="New Password" showKey="new"
                        show={show.new} onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
                        {...field("newPassword")} />
                    <PasswordField label="Confirm New Password" showKey="confirm"
                        show={show.confirm} onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                        {...field("confirmPassword")} />
                    <Button type="submit" loading={loading}>Update Password</Button>
                </form>
            </div>
        </div>
    );
}

function PasswordField({
    label, show, onToggle, value, onChange,
}: {
    label: string; show: boolean; onToggle: () => void;
    value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showKey: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <div className="relative">
                <input type={show ? "text" : "password"} value={value} onChange={onChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-700 bg-white px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

