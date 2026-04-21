"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, Building2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function OwnerSignupPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [form, setForm] = useState({
        gymName: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        if (!form.gymName || !form.firstName || !form.lastName || !form.email || !form.password) {
            setError("All fields are required.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    createNewGym: true,
                    role: "ADMIN",
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                setError(json.error || "Something went wrong.");
                return;
            }

            login(json.data.token, json.data.user, json.data.tenant);
            router.push("/dashboard");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-blue-600 via-cyan-700 to-blue-800 p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white translate-x-1/3 translate-y-1/3" />
                </div>
                <div className="relative flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                        <Dumbbell size={15} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">GymSaaS</span>
                </div>
                <div className="relative space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-4 py-2 text-sm text-blue-100">
                        <Building2 size={16} />
                        Gym Owner Registration
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Build Your<br />Fitness Empire
                    </h1>
                    <p className="text-blue-200 text-base leading-relaxed">
                        Create your gym, manage members and trainers, and grow your fitness business with powerful tools.
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Complete gym management",
                            "Member & trainer control",
                            "Revenue analytics",
                            "Automated billing"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-blue-100 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative text-blue-300 text-xs">© 2025 GymSaaS. All rights reserved.</p>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 bg-slate-50">
                <div className="w-full max-w-sm">
                    <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                        <ArrowLeft size={16} />
                        Back to role selection
                    </Link>

                    <div className="mb-8 text-center lg:hidden">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 mb-3">
                            <Building2 size={18} className="text-white" />
                        </div>
                        <p className="font-bold text-slate-900">Gym Owner Signup</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Create Your Gym</h2>
                        <p className="mt-1 text-sm text-slate-500">Start managing your fitness business</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            <span className="mt-0.5 shrink-0">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Gym Name"
                            placeholder="e.g., FitZone Gym"
                            {...field("gymName")}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input label="First Name" placeholder="John" {...field("firstName")} />
                            <Input label="Last Name" placeholder="Doe" {...field("lastName")} />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            {...field("email")}
                        />

                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="+1 555 000 0000"
                            {...field("phone")}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="mt-2 bg-blue-600 hover:bg-blue-500"
                        >
                            Create Gym & Admin Account
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
