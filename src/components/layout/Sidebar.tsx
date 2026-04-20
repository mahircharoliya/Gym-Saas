"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Dumbbell } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "@/lib/nav";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, tenant, logout } = useAuth();

    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.roles || item.roles.includes(user?.role ?? "")
    );

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                    <Dumbbell size={16} className="text-black" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-black">
                        {tenant?.name ?? "GymSaaS"}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                        {user?.role?.toLowerCase()}
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {visibleItems.map((item) => {
                    const active =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                active
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-black"
                            )}
                        >
                            <item.icon size={17} className={active ? "text-blue-500" : ""} />
                            {item.label}
                            {active && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="border-t border-slate-200 p-3">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-black shrink-0">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-black">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        title="Sign out"
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

