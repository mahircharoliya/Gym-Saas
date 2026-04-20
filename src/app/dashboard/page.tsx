"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, CreditCard, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Link from "next/link";

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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h2 className="text-2xl font-bold text-black">
                    {greeting}, {user?.firstName} 👋
                </h2>
                <p className="text-sm text-slate-400 mt-1">Here&apos;s what&apos;s happening at your gym today.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Members"
                    value={overview?.totalMembers ?? "—"}
                    sub={overview ? `+${overview.newMembers} this month` : undefined}
                    trend={overview ? parseFloat(overview.growthRate) : undefined}
                    icon={Users} iconColor="text-blue-500" iconBg="bg-blue-50" />
                <StatCard label="Active Plans"
                    value={overview?.activeMembers ?? "—"}
                    icon={CreditCard} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <StatCard label="Check-ins (30d)"
                    value={overview?.totalCheckIns ?? "—"}
                    icon={CalendarDays} iconColor="text-sky-500" iconBg="bg-sky-50" />
                <StatCard label="MRR"
                    value={overview ? `$${Number(overview.mrr).toLocaleString()}` : "—"}
                    icon={TrendingUp} iconColor="text-violet-500" iconBg="bg-violet-50" />
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <QuickCard
                    title="Recent Check-ins"
                    description="See who checked in today and manage attendance."
                    href="/dashboard/checkin"
                    cta="Go to Check-In"
                    accent="blue"
                />
                <QuickCard
                    title="Upcoming Classes"
                    description="View and manage your weekly class schedule."
                    href="/dashboard/classes"
                    cta="View Schedule"
                    accent="violet"
                />
            </div>
        </div>
    );
}

function QuickCard({ title, description, href, cta, accent }: {
    title: string; description: string; href: string; cta: string; accent: "blue" | "violet";
}) {
    const colors = {
        blue: "border-blue-100 hover:border-blue-200 hover:shadow-blue-100/50",
        violet: "border-violet-100 hover:border-violet-200 hover:shadow-violet-100/50",
    };
    const textColors = { blue: "text-blue-600", violet: "text-violet-600" };

    return (
        <div className={`rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 ${colors[accent]}`}>
            <p className="text-sm font-semibold text-black mb-1">{title}</p>
            <p className="text-sm text-slate-400 mb-5">{description}</p>
            <Link href={href} className={`inline-flex items-center gap-1.5 text-sm font-medium ${textColors[accent]} hover:gap-2.5 transition-all`}>
                {cta} <ArrowRight size={14} />
            </Link>
        </div>
    );
}

