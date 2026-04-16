"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
    const { token, user, login, tenant } = useAuth();
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: "",
            });
        }
    }, [user]);

    // Fetch full profile to get phone
    useEffect(() => {
        fetch("/api/member/profile", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) setForm({
                    firstName: json.data.firstName,
                    lastName: json.data.lastName,
                    phone: json.data.phone ?? "",
                });
            });
    }, [token]);

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
        if (!form.firstName || !form.lastName) return setError("Name is required.");
        setLoading(true);
        try {
            const res = await fetch("/api/member/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error);
            // Update auth context with new name
            login(token!, json.data, tenant!);
            setSuccess("Profile updated.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-lg space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <p className="text-sm text-gray-400 mt-0.5">Update your personal information.</p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
                {success && <p className="mb-4 text-sm text-emerald-400">{success}</p>}

                <form onSubmit={save} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" {...field("firstName")} />
                        <Input label="Last Name" {...field("lastName")} />
                    </div>
                    <Input label="Email" value={user?.email ?? ""} disabled
                        className="opacity-50 cursor-not-allowed" />
                    <Input label="Phone" type="tel" placeholder="+1 555 000 0000" {...field("phone")} />
                    <Button type="submit" loading={loading}>Save Changes</Button>
                </form>
            </div>

            {/* Avatar initials card */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shrink-0">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                    <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400 capitalize">
                        {user?.role?.toLowerCase()}
                    </span>
                </div>
            </div>
        </div>
    );
}
