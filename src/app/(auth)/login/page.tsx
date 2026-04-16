"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
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
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <span className="text-2xl font-bold text-indigo-400">GymSaaS</span>
                    <p className="mt-1 text-sm text-gray-400">Sign in to your account</p>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none transition hover:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="mt-2">
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
