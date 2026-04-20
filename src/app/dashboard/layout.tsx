"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <p className="text-xs text-slate-400 animate-pulse">Loading…</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50">{children}</main>
            </div>
        </div>
    );
}

