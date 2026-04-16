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
        <header className="flex h-14 items-center border-b border-gray-800 bg-gray-900 px-6">
            <h1 className="text-sm font-semibold text-white">
                {current?.label ?? "Dashboard"}
            </h1>
        </header>
    );
}
