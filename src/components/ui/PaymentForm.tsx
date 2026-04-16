"use client";

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import Input from "./Input";
import Button from "./Button";

interface Props {
    amount: number;
    productName: string;
    billingInterval: string;
    onPay: (card: { cardNumber: string; expirationDate: string; cvv: string }) => Promise<void>;
    onBack: () => void;
}

const INTERVAL: Record<string, string> = {
    ONCE: "one-time", MONTHLY: "/mo", YEARLY: "/yr", WEEKLY: "/wk", DAILY: "/day",
};

export default function PaymentForm({ amount, productName, billingInterval, onPay, onBack }: Props) {
    const [card, setCard] = useState({ cardNumber: "", expirationDate: "", cvv: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function set(key: keyof typeof card, value: string) {
        setCard((c) => ({ ...c, [key]: value }));
    }

    // Format card number with spaces
    function formatCard(v: string) {
        return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }

    // Format expiry MM/YY → YYYY-MM for Authorize.net
    function formatExpiry(v: string) {
        return v.replace(/\D/g, "").slice(0, 4)
            .replace(/^(\d{2})(\d)/, "$1/$2");
    }

    function expiryToApi(v: string): string {
        const [mm, yy] = v.split("/");
        if (!mm || !yy) return v;
        const year = yy.length === 2 ? `20${yy}` : yy;
        return `${year}-${mm}`;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!card.cardNumber || !card.expirationDate || !card.cvv)
            return setError("All card fields are required.");
        setLoading(true);
        try {
            await onPay({
                cardNumber: card.cardNumber.replace(/\s/g, ""),
                expirationDate: expiryToApi(card.expirationDate),
                cvv: card.cvv,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Payment</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock size={11} /> Secured by Authorize.net
                </div>
            </div>

            {/* Order summary */}
            <div className="rounded-lg bg-gray-950 px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-white">{productName}</p>
                    <p className="text-xs text-gray-500">{INTERVAL[billingInterval] ?? billingInterval}</p>
                </div>
                <p className="text-lg font-bold text-white">${amount.toFixed(2)}</p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-300">Card Number</label>
                    <div className="relative">
                        <input
                            value={card.cardNumber}
                            onChange={(e) => set("cardNumber", formatCard(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Expiry</label>
                        <input
                            value={card.expirationDate}
                            onChange={(e) => set("expirationDate", formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                    </div>
                    <Input label="CVV" value={card.cvv}
                        onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123" className="font-mono" />
                </div>

                <div className="flex gap-3 pt-1">
                    <Button variant="ghost" type="button" onClick={onBack} className="flex-1">Back</Button>
                    <Button type="submit" loading={loading} className="flex-1">
                        Pay ${amount.toFixed(2)}
                    </Button>
                </div>
            </form>
        </div>
    );
}
