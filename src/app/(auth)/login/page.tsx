"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Email and password are required."); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error || "Something went wrong."); return; }
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
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-violet-800 p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white translate-x-1/3 translate-y-1/3" />
                </div>
                <div className="relative flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                        <Dumbbell size={15} className="text-black" />
                    </div>
                    <span className="text-lg font-bold text-black">GymSaaS</span>
                </div>
                <div className="relative space-y-6">
                    <h1 className="text-4xl font-bold text-black leading-tight">
                        Welcome back.<br />Let&apos;s get to work.
                    </h1>
                    <p className="text-blue-200 text-base leading-relaxed">
                        Your gym dashboard is waiting. Sign in to manage members, classes, and more.
                    </p>
                    <ul className="space-y-3">
                        {["Real-time analytics", "Automated billing", "QR check-in system"].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-blue-100 text-sm">
                                <CheckCircle2 size={16} className="text-blue-300 shrink-0" />
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
                    <div className="mb-8 text-center lg:hidden">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 mb-3">
                            <Dumbbell size={18} className="text-black" />
                        </div>
                        <p className="font-bold text-black">GymSaaS</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-black">Sign in</h2>
                        <p className="mt-1 text-sm text-slate-400">Welcome back, enter your credentials</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            <span className="mt-0.5 shrink-0">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Input label="Email address" type="email" placeholder="john@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-black placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button type="button" onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="mt-1">Sign In</Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

