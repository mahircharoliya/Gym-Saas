"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, DollarSign, RefreshCw, BarChart3, AlertCircle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const RANGES = [{ label: "7d", value: "7" }, { label: "30d", value: "30" }, { label: "90d", value: "90" }, { label: "1yr", value: "365" }];
const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function FinancialAnalyticsPage() {
    const { token } = useAuth();
    const [range, setRange] = useState("30");
    const [data, setData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/analytics/financial?range=${range}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setData(json.data);
        setLoading(false);
    }, [token, range]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const lifetime = data?.lifetime as Record<string, unknown> | undefined;
    const rangeData = data?.range as Record<string, unknown> | undefined;
    const daily = (data?.dailySeries as { date: string; revenue: number }[]) ?? [];
    const revenueByType = (lifetime?.revenueByType as { name: string; revenue: string }[]) ?? [];

    function fmtDate(d: string) {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    function fmtMoney(v: unknown) {
        return v ? `$${Number(v).toLocaleString()}` : "—";
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-black">Financial Analytics</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Revenue, MRR, ARR, and payment metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    {RANGES.map((r) => (
                        <button key={r.value} onClick={() => setRange(r.value)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${range === r.value ? "bg-blue-600 text-black" : "border border-gray-700 text-gray-400 hover:text-black"}`}>
                            {r.label}
                        </button>
                    ))}
                    <button onClick={fetch_} className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-black transition-colors">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Lifetime KPIs */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Lifetime Metrics</p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <StatCard label="Lifetime Revenue" value={fmtMoney(lifetime?.lifetimeRevenue)}
                        icon={DollarSign} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                    <StatCard label="Member LTV" value={fmtMoney(lifetime?.ltv)}
                        sub="avg revenue per member"
                        icon={TrendingUp} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
                    <StatCard label="Revenue Sources" value={String(revenueByType.length)}
                        sub="membership types"
                        icon={BarChart3} iconColor="text-sky-400" iconBg="bg-sky-500/10" />
                </div>
            </div>

            {/* Range KPIs */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Period Metrics</p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        { label: "Total Revenue", value: fmtMoney(rangeData?.totalRevenue) },
                        { label: "MRR", value: fmtMoney(rangeData?.mrr) },
                        { label: "ARR", value: fmtMoney(rangeData?.arr) },
                        { label: "ARPU", value: fmtMoney(rangeData?.arpu) },
                        { label: "Refunds", value: String(rangeData?.refunds ?? "—") },
                        { label: "Failed Payments", value: String(rangeData?.failedPayments ?? "—") },
                        { label: "Outstanding", value: fmtMoney(rangeData?.outstandingPayments) },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-gray-800 bg-white p-5">
                            <p className="text-sm text-gray-400">{s.label}</p>
                            <p className="text-2xl font-bold text-black mt-2">{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-white p-6">
                    <p className="text-sm font-medium text-black mb-4">Revenue Over Time</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={daily.map((d) => ({ ...d, date: fmtDate(d.date) }))} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }} formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-gray-800 bg-white p-6">
                    <p className="text-sm font-medium text-black mb-4">Revenue by Plan</p>
                    {revenueByType.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={revenueByType} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                                    {revenueByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }} formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Summary table */}
            <div className="rounded-xl border border-gray-800 bg-white p-6">
                <p className="text-sm font-medium text-black mb-4">Revenue by Membership Type</p>
                {revenueByType.length === 0 ? (
                    <p className="text-sm text-gray-500">No data yet.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="pb-3 text-left">Plan</th>
                                <th className="pb-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenueByType.map((r) => (
                                <tr key={r.name} className="border-b border-gray-800/50">
                                    <td className="py-3 text-gray-300">{r.name}</td>
                                    <td className="py-3 text-right font-medium text-black">${Number(r.revenue).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

