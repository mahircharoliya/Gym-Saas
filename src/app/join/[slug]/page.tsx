"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, Dumbbell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { renderWaiver } from "@/lib/waiver";

interface Product {
    id: string; name: string; description?: string;
    price: string; comparePrice?: string; billingInterval: string;
    membershipType: string; discountPercent?: string;
}
interface Waiver { id: string; title: string; body: string }
interface FormData {
    form: { id: string; name: string; description?: string };
    tenant: { name: string };
    products: Product[];
    waivers: Waiver[];
}

const INTERVAL: Record<string, string> = {
    ONCE: "one-time", MONTHLY: "/mo", YEARLY: "/yr",
    WEEKLY: "/wk", DAILY: "/day",
};

export default function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { login } = useAuth();

    const [data, setData] = useState<FormData | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [step, setStep] = useState<"plan" | "info" | "waiver" | "done">("plan");

    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [acceptedWaivers, setAcceptedWaivers] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/public/forms/${slug}`)
            .then((r) => r.json())
            .then((json) => {
                if (!json.success) return setNotFound(true);
                setData(json.data);
                if (json.data.products.length === 0) setStep("info");
            })
            .catch(() => setNotFound(true));
    }, [slug]);

    function field(key: keyof typeof form) {
        return {
            value: form[key],
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value })),
        };
    }

    function toggleWaiver(id: string) {
        setAcceptedWaivers((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    async function submit() {
        setError("");
        const allWaiverIds = data?.waivers.map((w) => w.id) ?? [];
        const unaccepted = allWaiverIds.filter((id) => !acceptedWaivers.includes(id));
        if (unaccepted.length > 0) return setError("Please accept all waivers to continue.");

        setLoading(true);
        try {
            const res = await fetch(`/api/public/forms/${slug}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, productId: selectedProduct, acceptedWaiverIds: acceptedWaivers }),
            });
            const json = await res.json();
            if (!res.ok) return setError(json.error || "Something went wrong.");
            login(json.data.token, json.data.user, json.data.tenant);
            setStep("done");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (notFound) {
        return (
            <div className="flex min-h-screen items-center justify-center text-center px-4">
                <div>
                    <p className="text-2xl font-bold text-white mb-2">Form not found</p>
                    <p className="text-gray-400 text-sm">This signup link is inactive or doesn&apos;t exist.</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (step === "done") {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="text-center">
                    <CheckCircle2 size={56} className="mx-auto mb-4 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h2>
                    <p className="text-gray-400 text-sm mb-6">Welcome to {data.tenant.name}.</p>
                    <Button onClick={() => router.push("/dashboard")} className="w-auto px-8">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-12">
            <div className="mx-auto max-w-lg">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 mx-auto mb-3">
                        <Dumbbell size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">{data.tenant.name}</h1>
                    <p className="text-sm text-gray-400 mt-1">{data.form.name}</p>
                </div>

                {/* Step: Plan selection */}
                {step === "plan" && data.products.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-300 text-center">Choose a plan</p>
                        {data.products.map((p) => (
                            <button key={p.id} onClick={() => setSelectedProduct(p.id)}
                                className={`w-full rounded-xl border p-5 text-left transition-all ${selectedProduct === p.id
                                        ? "border-indigo-500 bg-indigo-500/10"
                                        : "border-gray-700 bg-gray-900 hover:border-gray-600"
                                    }`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-white">{p.name}</p>
                                        {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="font-bold text-white">${Number(p.price).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{INTERVAL[p.billingInterval] ?? ""}</p>
                                        {p.comparePrice && (
                                            <p className="text-xs text-gray-500 line-through">${Number(p.comparePrice).toFixed(2)}</p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                        <Button onClick={() => setStep("info")} className="mt-2"
                            disabled={data.products.length > 0 && !selectedProduct}>
                            Continue
                        </Button>
                    </div>
                )}

                {/* Step: Personal info */}
                {step === "info" && (
                    <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <p className="text-sm font-medium text-white">Your information</p>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="First Name" placeholder="John" {...field("firstName")} />
                            <Input label="Last Name" placeholder="Doe" {...field("lastName")} />
                        </div>
                        <Input label="Email" type="email" placeholder="john@example.com" {...field("email")} />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                                    {...field("password")}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500" />
                                <button type="button" onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            {data.products.length > 0 && (
                                <Button variant="ghost" onClick={() => setStep("plan")} className="flex-1">Back</Button>
                            )}
                            <Button className="flex-1" onClick={() => {
                                if (!form.firstName || !form.lastName || !form.email || !form.password)
                                    return setError("All fields are required.");
                                if (form.password.length < 8) return setError("Password must be at least 8 characters.");
                                setError("");
                                data.waivers.length > 0 ? setStep("waiver") : submit();
                            }}>
                                {data.waivers.length > 0 ? "Continue" : "Create Account"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step: Waivers */}
                {step === "waiver" && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-white text-center">Review & sign waivers</p>
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        {data.waivers.map((w) => (
                            <div key={w.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                                <p className="font-medium text-white mb-3">{w.title}</p>
                                <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                                    {renderWaiver(w.body, { firstName: form.firstName, lastName: form.lastName })}
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={acceptedWaivers.includes(w.id)}
                                        onChange={() => toggleWaiver(w.id)} className="accent-indigo-500 h-4 w-4" />
                                    <span className="text-sm text-gray-300">
                                        I, {form.firstName} {form.lastName}, agree to this waiver
                                    </span>
                                </label>
                            </div>
                        ))}
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setStep("info")} className="flex-1">Back</Button>
                            <Button onClick={submit} loading={loading} className="flex-1">Create Account</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
