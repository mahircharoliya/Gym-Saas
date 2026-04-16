"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

const ALL_TABS = [
    { label: "General", href: "/dashboard/settings", roles: ["ADMIN", "MANAGER"] },
    { label: "Team", href: "/dashboard/settings/team", roles: ["ADMIN"] },
    { label: "Password", href: "/dashboard/settings/password", roles: ["ADMIN", "MANAGER", "TRAINER", "MEMBER"] },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const tabs = ALL_TABS.filter((t) => t.roles.includes(user?.role ?? ""));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white">Settings</h2>
                <p className="text-sm text-gray-400 mt-0.5">Manage your gym and account settings.</p>
            </div>

            <div className="flex gap-1 border-b border-gray-800">
                {tabs.map((tab) => {
                    const active = tab.href === "/dashboard/settings"
                        ? pathname === tab.href
                        : pathname.startsWith(tab.href);
                    return (
                        <Link key={tab.href} href={tab.href}
                            className={clsx(
                                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                                active
                                    ? "border-indigo-500 text-white"
                                    : "border-transparent text-gray-400 hover:text-white"
                            )}>
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            {children}
        </div>
    );
}
