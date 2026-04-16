"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, CreditCard, CalendarDays, TrendingUp } from "lucide-react";
import StatCard from "@/components/ui/StatCard";

interface Overview {
    totalMembers: number; newMembers: number;
    activeMembers: number; mrr: string; totalCheckIns: number;
    growthRate: string;
}

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [overview, setOverview] = useState<Overview | null>(null);

    useEffect(() => {
        fetch("/api/analytics?range=30", { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((j) => { if (j.success) setOverview(j.data.overview); });
    }, [token]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-white">
                    Good to see you, {user?.firstName}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Here&apos;s what&apos;s happening at your gym today.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Members"
                    value={overview?.totalMembers ?? "—"}
                    sub={overview ? `+${overview.newMembers} this month` : undefined}
                    trend={overview ? parseFloat(overview.growthRate) : undefined}
                    icon={Users} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" />
                <StatCard label="Active Plans"
                    value={overview?.activeMembers ?? "—"}
                    icon={CreditCard} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
                <StatCard label="Check-ins (30d)"
                    value={overview?.totalCheckIns ?? "—"}
                    icon={CalendarDays} iconColor="text-sky-400" iconBg="bg-sky-500/10" />
                <StatCard label="MRR"
                    value={overview ? `$${Number(overview.mrr).toLocaleString()}` : "—"}
                    icon={TrendingUp} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                    <p className="text-sm font-medium text-white mb-4">Recent Check-ins</p>
                    <p className="text-sm text-gray-500">Visit the Check-In page to see today&apos;s activity.</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                    <p className="text-sm font-medium text-white mb-4">Upcoming Classes</p>
                    <p className="text-sm text-gray-500">Visit the Classes page to manage your schedule.</p>
                </div>
            </div>
        </div>
    );
}
