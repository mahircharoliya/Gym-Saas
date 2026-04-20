"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function AcceptInviteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const token = searchParams.get("token");

    const [form, setForm] = useState({
        firstName: "", lastName: "", password: "", confirmPassword: "",
    });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) setError("Invalid or missing invite token.");
    }, [token]);

    function field(key: keyof typeof form) {
        return {
            value: form[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value })),
        };
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.firstName || !form.lastName || !form.password)
            return setError("All fields are required.");
        if (form.password !== form.confirmPassword)
            return setError("Passwords do not match.");

        setLoading(true);
        try {
            const res = await fetch("/api/invites/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, ...form }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error || "Something went wrong.");
            login(json.data.token, json.data.user, json.data.tenant);
            router.push("/dashboard");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <span className="text-2xl font-bold text-blue-400">GymSaaS</span>
                    <p className="mt-1 text-sm text-gray-400">Accept your invitation</p>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-white p-8 shadow-xl">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="First Name" placeholder="John" {...field("firstName")} />
                            <Input label="Last Name" placeholder="Doe" {...field("lastName")} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="Min 8 characters"
                                    {...field("password")}
                                    className="w-full rounded-lg border border-gray-700 bg-white px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button type="button" onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Repeat password"
                            {...field("confirmPassword")}
                        />

                        <Button type="submit" loading={loading} className="mt-2">
                            Create Account
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense>
            <AcceptInviteForm />
        </Suspense>
    );
}

