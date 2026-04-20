"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
    { label: "Overview", href: "/dashboard/reports" },
    { label: "Membership", href: "/dashboard/reports/membership" },
    { label: "Financial", href: "/dashboard/reports/financial" },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div className="space-y-6">
            <div className="flex gap-1 border-b border-gray-800">
                {TABS.map((tab) => {
                    const active = tab.href === "/dashboard/reports"
                        ? pathname === tab.href
                        : pathname.startsWith(tab.href);
                    return (
                        <Link key={tab.href} href={tab.href}
                            className={clsx(
                                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                                active ? "border-blue-500 text-black" : "border-transparent text-gray-400 hover:text-black"
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

