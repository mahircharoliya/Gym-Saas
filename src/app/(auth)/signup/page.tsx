"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, CheckCircle2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface FormState {
    firstName: string; lastName: string; email: string;
    gymName: string; role: string; password: string; confirmPassword: string;
}
type FormErrors = Partial<FormState>;

const ROLES = [
    { value: "TRAINER", label: "Trainer", description: "Manage calendar & settings", icon: Dumbbell },
    { value: "MEMBER", label: "Member", description: "Access classes & profile", icon: User },
];

export default function SignupPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [form, setForm] = useState<FormState>({
        firstName: "", lastName: "", email: "", gymName: "",
        role: "TRAINER", password: "", confirmPassword: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    function validate(): boolean {
        const e: FormErrors = {};
        if (!form.firstName.trim()) e.firstName = "Required";
        if (!form.lastName.trim()) e.lastName = "Required";
        if (!form.email.trim()) e.email = "Required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
        if (!form.gymName.trim()) e.gymName = "Required";
        if (!form.password) e.password = "Required";
        else if (form.password.length < 8) e.password = "Min 8 characters";
        if (!form.confirmPassword) e.confirmPassword = "Required";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setServerError("");
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) { setServerError(json.error || "Something went wrong."); return; }
            login(json.data.token, json.data.user, json.data.tenant);
            router.push("/dashboard");
        } catch {
            setServerError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function field(key: keyof FormState) {
        return {
            value: form[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value })),
            error: errors[key],
        };
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
                        Run your gym<br />smarter, not harder.
                    </h1>
                    <p className="text-black text-base leading-relaxed">
                        Everything you need to manage members, classes, and payments — all in one place.
                    </p>
                    <ul className="space-y-3">
                        {["Member management", "Class scheduling", "Automated billing"].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-black text-sm">
                                <CheckCircle2 size={16} className="text-black shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative text-black text-xs">© 2025 GymSaaS. All rights reserved.</p>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 overflow-y-auto bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:hidden">
                        <span className="text-2xl font-bold text-black">GymSaaS</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-black">Create your account</h2>
                        <p className="mt-1 text-sm text-black">Get started in under a minute</p>
                    </div>

                    {serverError && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            <span className="mt-0.5 shrink-0">⚠</span>
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="First Name" placeholder="John" {...field("firstName")} />
                            <Input label="Last Name" placeholder="Doe" {...field("lastName")} />
                        </div>
                        <Input label="Email address" type="email" placeholder="john@example.com" {...field("email")} />
                        <Input label="Gym Name" placeholder="Iron Fitness" {...field("gymName")} />

                        {/* Role cards */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-black">Your role</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map(({ value, label, description, icon: Icon }) => {
                                    const active = form.role === value;
                                    return (
                                        <button key={value} type="button"
                                            onClick={() => setForm((f) => ({ ...f, role: value }))}
                                            className={`relative flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all duration-150 ${active
                                                    ? "border-blue-400 bg-blue-50 ring-1 ring-blue-300"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                }`}>
                                            <div className={`rounded-lg p-1.5 ${active ? "bg-blue-100 text-black" : "bg-slate-100 text-black"}`}>
                                                <Icon size={15} />
                                            </div>
                                            <span className={`text-sm font-semibold ${active ? "text-black" : "text-black"}`}>
                                                {label}
                                            </span>
                                            <span className="text-xs text-black leading-snug">{description}</span>
                                            {active && (
                                                <span className="absolute top-3 right-3 text-black">
                                                    <CheckCircle2 size={14} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-black">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters"
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-black placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                <button type="button" onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-black">Confirm Password</label>
                            <div className="relative">
                                <input type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-black placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black transition-colors">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        <Button type="submit" loading={loading} className="mt-1">Create Account</Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-black">
                        Already have an account?{" "}
                        <Link href="/login" className="text-black hover:text-black font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}


