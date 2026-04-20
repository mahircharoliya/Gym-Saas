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
                <h2 className="text-xl font-bold text-black">Profile</h2>
                <p className="text-sm text-slate-400 mt-1">Update your personal information.</p>
            </div>

            {/* Avatar card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-bold text-black shrink-0 shadow-lg shadow-blue-500/20">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                    <p className="font-semibold text-black">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600 capitalize">
                        {user?.role?.toLowerCase()}
                    </span>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                {success && <p className="mb-4 text-sm text-emerald-600">{success}</p>}

                <form onSubmit={save} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" {...field("firstName")} />
                        <Input label="Last Name" {...field("lastName")} />
                    </div>
                    <Input label="Email" value={user?.email ?? ""} disabled />
                    <Input label="Phone" type="tel" placeholder="+1 555 000 0000" {...field("phone")} />
                    <Button type="submit" loading={loading}>Save Changes</Button>
                </form>
            </div>
        </div>
    );
}

