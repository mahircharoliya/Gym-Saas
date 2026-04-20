"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export default function Header() {
    const pathname = usePathname();

    const current = NAV_ITEMS.find((item) =>
        item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
    );

    return (
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                {current?.icon && (
                    <current.icon size={16} className="text-slate-400" />
                )}
                <h1 className="text-sm font-semibold text-black">
                    {current?.label ?? "Dashboard"}
                </h1>
            </div>
        </header>
    );
}

