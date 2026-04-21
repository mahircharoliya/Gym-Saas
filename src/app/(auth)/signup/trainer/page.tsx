"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, Award, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Gym {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    address?: string;
}

export default function TrainerSignupPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [form, setForm] = useState({
        gymSlug: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        certifications: "",
    });
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingGyms, setLoadingGyms] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGyms();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    async function fetchGyms() {
        setLoadingGyms(true);
        try {
            const res = await fetch(`/api/gyms?search=${encodeURIComponent(searchTerm)}`);

            // Check if response is JSON
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("API returned non-JSON response");
                setError("Failed to load gyms. Please try again.");
                setGyms([]);
                return;
            }

            const json = await res.json();
            if (res.ok && json.success) {
                setGyms(json.data.gyms || []);
            } else {
                console.error("API error:", json.error);
                setGyms([]);
            }
        } catch (err) {
            console.error("Failed to fetch gyms:", err);
            setGyms([]);
        } finally {
            setLoadingGyms(false);
        }
    }

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

        if (!form.gymSlug || !form.firstName || !form.lastName || !form.email || !form.password) {
            setError("All required fields must be filled.");
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
                    role: "TRAINER",
                    createNewGym: false,
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

    const selectedGym = gyms.find(g => g.slug === form.gymSlug);

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-12 relative overflow-hidden">
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/30 px-4 py-2 text-sm text-violet-100">
                        <Award size={16} />
                        Trainer Registration
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Empower Others.<br />Lead Classes.
                    </h1>
                    <p className="text-violet-200 text-base leading-relaxed">
                        Join as a trainer to manage classes, track member progress, and build your fitness community.
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Create and manage classes",
                            "Track member attendance",
                            "Schedule your sessions",
                            "Build your reputation"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-violet-100 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative text-violet-300 text-xs">© 2025 GymSaaS. All rights reserved.</p>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 bg-slate-50">
                <div className="w-full max-w-sm">
                    <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                        <ArrowLeft size={16} />
                        Back to role selection
                    </Link>

                    <div className="mb-8 text-center lg:hidden">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-3">
                            <Award size={18} className="text-white" />
                        </div>
                        <p className="font-bold text-slate-900">Trainer Signup</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Join as Trainer</h2>
                        <p className="mt-1 text-sm text-slate-500">Select your gym and create your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            <span className="mt-0.5 shrink-0">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Gym Selection */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Select Your Gym *
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search gyms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>
                            {loadingGyms ? (
                                <div className="text-xs text-slate-400 mt-1">Loading gyms...</div>
                            ) : (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                                    {gyms.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No gyms found. Try a different search.
                                        </div>
                                    ) : (
                                        gyms.map((gym) => (
                                            <button
                                                key={gym.id}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, gymSlug: gym.slug }))}
                                                className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-violet-50 transition-colors ${form.gymSlug === gym.slug ? "bg-violet-50 border-l-4 border-l-violet-500" : ""
                                                    }`}
                                            >
                                                <div className="font-medium text-sm text-slate-900">{gym.name}</div>
                                                {gym.address && (
                                                    <div className="text-xs text-slate-500 mt-0.5">{gym.address}</div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                            {selectedGym && (
                                <div className="text-xs text-violet-600 mt-1">
                                    ✓ Selected: {selectedGym.name}
                                </div>
                            )}
                        </div>

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
                            label="Phone Number (Optional)"
                            type="tel"
                            placeholder="+1 555 000 0000"
                            {...field("phone")}
                        />

                        <Input
                            label="Specialization (Optional)"
                            placeholder="e.g., Yoga, CrossFit, Personal Training"
                            {...field("specialization")}
                        />

                        <Input
                            label="Certifications (Optional)"
                            placeholder="e.g., ACE, NASM, ISSA"
                            {...field("certifications")}
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
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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
                            className="mt-2 bg-violet-600 hover:bg-violet-500"
                        >
                            Create Trainer Account
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-violet-600 hover:text-violet-500 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
