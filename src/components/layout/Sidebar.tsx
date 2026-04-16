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
        <aside className="flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-900">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                    <Dumbbell size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                        {tenant?.name ?? "GymSaaS"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
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
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                active
                                    ? "bg-indigo-600/20 text-indigo-400"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="border-t border-gray-800 p-3">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        title="Sign out"
                        className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
