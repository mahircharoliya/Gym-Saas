"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, CheckCircle2, XCircle, UserCheck, Download } from "lucide-react";
import dynamic from "next/dynamic";
import QRCode from "react-qr-code";

const QRScanner = dynamic(() => import("@/components/checkin/QRScanner"), { ssr: false });

interface Member {
    id: string; firstName: string; lastName: string; email: string;
    memberProducts: { id: string; visitsRemaining?: number; product: { name: string; membershipType: string } }[];
}

interface CheckInRecord {
    id: string; method: string; createdAt: string;
    user: { firstName: string; lastName: string; email: string };
    membership?: { plan: string; visitsRemaining?: number };
}

interface Toast { type: "success" | "error"; message: string }

export default function CheckInPage() {
    const { token } = useAuth();
    const [tab, setTab] = useState<"manual" | "qr">("manual");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Member[]>([]);
    const [searching, setSearching] = useState(false);
    const [todayCheckIns, setTodayCheckIns] = useState<CheckInRecord[]>([]);
    const [toast, setToast] = useState<Toast | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (type: Toast["type"], message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchToday = useCallback(async () => {
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(`/api/checkin?date=${today}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setTodayCheckIns(json.data);
    }, [token]);

    useEffect(() => { fetchToday(); }, [fetchToday]);

    // Debounced member search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.length < 2) { setResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            const res = await fetch(`/api/checkin/lookup?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (res.ok) setResults(json.data);
            setSearching(false);
        }, 300);
    }, [query, token]);

    async function checkIn(userId: string, method: "MANUAL" | "QR") {
        const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId, method }),
        });
        const json = await res.json();
        if (!res.ok) {
            showToast("error", json.error ?? "Check-in failed.");
            return;
        }
        const { checkIn: ci, membership } = json.data;
        showToast("success",
            `✓ ${ci.user.firstName} ${ci.user.lastName} checked in` +
            (membership?.visitsRemaining != null ? ` · ${membership.visitsRemaining} visits left` : "")
        );
        setQuery(""); setResults([]);
        fetchToday();
    }

    async function handleQRScan(raw: string) {
        try {
            const data = JSON.parse(raw);
            if (data.type !== "checkin" || !data.userId) {
                showToast("error", "Invalid QR code.");
                return;
            }
            await checkIn(data.userId, "QR");
        } catch {
            showToast("error", "Could not read QR code.");
        }
    }

    // Members see their personal QR only
    if (user?.role === "MEMBER") {
        const qrValue = JSON.stringify({ userId: user.id, tenantId: tenant?.id, type: "checkin" });
        function downloadSVG() {
            const svg = document.getElementById("member-qr-ci");
            if (!svg) return;
            const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "checkin-qr.svg";
            a.click();
        }
        return (
            <div className="max-w-sm mx-auto space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-white">Check-In QR Code</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Show this at the front desk to check in.</p>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 flex flex-col items-center gap-6">
                    <div className="rounded-xl bg-white p-5">
                        <QRCode id="member-qr-ci" value={qrValue} size={200} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-400">{tenant?.name}</p>
                    </div>
                    <button onClick={downloadSVG}
                        className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors w-full justify-center">
                        <Download size={15} /> Download QR
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-lg font-semibold text-white">Check-In</h2>
                <p className="text-sm text-gray-400 mt-0.5">Manually search or scan a member QR code.</p>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${toast.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}>
                    {toast.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border border-gray-800 bg-gray-900 p-1 w-fit">
                {(["manual", "qr"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize ${tab === t ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                            }`}>
                        {t === "manual" ? "Manual Search" : "QR Scan"}
                    </button>
                ))}
            </div>

            {/* Manual search */}
            {tab === "manual" && (
                <div className="space-y-3">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or email…"
                            className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {searching && (
                        <p className="text-xs text-gray-500 px-1">Searching…</p>
                    )}

                    {results.length > 0 && (
                        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
                            {results.map((m) => {
                                const plan = m.memberProducts[0];
                                return (
                                    <div key={m.id}
                                        className="flex items-center justify-between px-4 py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {m.firstName} {m.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">{m.email}</p>
                                            {plan ? (
                                                <p className="text-xs text-indigo-400 mt-0.5">
                                                    {plan.product.name}
                                                    {plan.visitsRemaining != null && ` · ${plan.visitsRemaining} visits left`}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-red-400 mt-0.5">No active plan</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => checkIn(m.id, "MANUAL")}
                                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors">
                                            <UserCheck size={13} /> Check In
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* QR scan */}
            {tab === "qr" && (
                <QRScanner onScan={handleQRScan} />
            )}

            {/* Today's check-ins */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Today — {todayCheckIns.length} check-in{todayCheckIns.length !== 1 ? "s" : ""}
                </p>
                {todayCheckIns.length === 0 ? (
                    <p className="text-sm text-gray-600">No check-ins yet today.</p>
                ) : (
                    <div className="space-y-2">
                        {todayCheckIns.map((ci) => (
                            <div key={ci.id}
                                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400 shrink-0">
                                        {ci.user.firstName[0]}{ci.user.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {ci.user.firstName} {ci.user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{ci.user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {new Date(ci.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                    <span className={`text-xs ${ci.method === "QR" ? "text-indigo-400" : "text-gray-500"}`}>
                                        {ci.method}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
