"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    Users, TrendingUp, CreditCard, Activity,
    UserMinus, BarChart3, RefreshCw,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const RANGES = [
    { label: "7d", value: "7" },
    { label: "30d", value: "30" },
    { label: "90d", value: "90" },
    { label: "1yr", value: "365" },
];

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface Overview {
    totalMembers: number; newMembers: number; activeMembers: number;
    cancelledInRange: number; mrr: string; arr: string;
    churnRate: string; growthRate: string; totalCheckIns: number;
}
interface DayPoint { date: string; checkIns: number; newMembers: number }
interface PlanPoint { name: string; count: number; type: string }

export default function ReportsPage() {
    const { token } = useAuth();
    const [range, setRange] = useState("30");
    const [overview, setOverview] = useState<Overview | null>(null);
    const [daily, setDaily] = useState<DayPoint[]>([]);
    const [plans, setPlans] = useState<PlanPoint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/analytics?range=${range}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
            setOverview(json.data.overview);
            setDaily(json.data.dailySeries);
            setPlans(json.data.planBreakdown);
        }
        setLoading(false);
    }, [token, range]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    // Format date labels for chart
    function fmtDate(d: string) {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    const chartData = daily.map((d) => ({ ...d, date: fmtDate(d.date) }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-white">Reports & Analytics</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Track growth, revenue, and engagement.</p>
                </div>
                <div className="flex items-center gap-2">
                    {RANGES.map((r) => (
                        <button key={r.value} onClick={() => setRange(r.value)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${range === r.value
                                    ? "bg-indigo-600 text-white"
                                    : "border border-gray-700 text-gray-400 hover:text-white"
                                }`}>
                            {r.label}
                        </button>
                    ))}
                    <button onClick={fetchAnalytics}
                        className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-white transition-colors">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {loading && !overview ? (
                <div className="flex justify-center py-20">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
            ) : overview && (
                <>
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatCard label="Total Members" value={overview.totalMembers}
                            sub={`+${overview.newMembers} this period`}
                            trend={parseFloat(overview.growthRate)}
                            icon={Users} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                        <StatCard label="Active Plans" value={overview.activeMembers}
                            sub={`${overview.cancelledInRange} cancelled`}
                            icon={CreditCard} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                        <StatCard label="MRR" value={`$${Number(overview.mrr).toLocaleString()}`}
                            sub={`ARR $${Number(overview.arr).toLocaleString()}`}
                            icon={TrendingUp} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
                        <StatCard label="Churn Rate" value={`${overview.churnRate}%`}
                            sub={`${overview.totalCheckIns} check-ins`}
                            icon={UserMinus} iconColor="text-sky-400" iconBg="bg-sky-500/10" />
                    </div>

                    {/* Check-ins area chart */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                        <p className="text-sm font-medium text-white mb-4">Daily Check-ins</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }}
                                    tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                    labelStyle={{ color: "#f9fafb" }} itemStyle={{ color: "#a5b4fc" }} />
                                <Area type="monotone" dataKey="checkIns" stroke="#6366f1" strokeWidth={2}
                                    fill="url(#ciGrad)" name="Check-ins" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* New members bar + plan pie */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                            <p className="text-sm font-medium text-white mb-4">New Members</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                    <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }}
                                        tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                        labelStyle={{ color: "#f9fafb" }} itemStyle={{ color: "#6ee7b7" }} />
                                    <Bar dataKey="newMembers" fill="#10b981" radius={[3, 3, 0, 0]} name="New Members" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                            <p className="text-sm font-medium text-white mb-4">Active Plans Breakdown</p>
                            {plans.length === 0 ? (
                                <div className="flex items-center justify-center h-48">
                                    <div className="text-center">
                                        <BarChart3 size={28} className="mx-auto mb-2 text-gray-600" />
                                        <p className="text-sm text-gray-500">No active plans yet.</p>
                                    </div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={plans} dataKey="count" nameKey="name"
                                            cx="50%" cy="50%" outerRadius={75} innerRadius={40}
                                            paddingAngle={3}>
                                            {plans.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                                            labelStyle={{ color: "#f9fafb" }} />
                                        <Legend iconType="circle" iconSize={8}
                                            formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Summary table */}
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                        <p className="text-sm font-medium text-white mb-4">Summary</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {[
                                { label: "ARR", value: `$${Number(overview.arr).toLocaleString()}` },
                                { label: "MRR", value: `$${Number(overview.mrr).toLocaleString()}` },
                                { label: "Active Plans", value: overview.activeMembers },
                                { label: "Churn Rate", value: `${overview.churnRate}%` },
                                { label: "Growth Rate", value: `${overview.growthRate}%` },
                                { label: "New Members", value: overview.newMembers },
                                { label: "Total Check-ins", value: overview.totalCheckIns },
                                { label: "Cancellations", value: overview.cancelledInRange },
                            ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-gray-800 px-4 py-3">
                                    <p className="text-xs text-gray-500">{item.label}</p>
                                    <p className="text-lg font-semibold text-white mt-0.5">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
