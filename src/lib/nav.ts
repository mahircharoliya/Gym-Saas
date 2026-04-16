import {
    LayoutDashboard,
    Users,
    CalendarDays,
    CreditCard,
    QrCode,
    Settings,
    BarChart3,
    Dumbbell,
    ClipboardList,
    UserCircle,
    FileText,
} from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    // If roles is undefined → visible to ALL roles
    // If roles is defined  → visible only to those roles
    roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
    // All roles
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

    // Admin + Manager only
    { label: "Members", href: "/dashboard/members", icon: Users, roles: ["ADMIN", "MANAGER"] },
    { label: "Products", href: "/dashboard/products", icon: Dumbbell, roles: ["ADMIN", "MANAGER"] },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
    { label: "Forms", href: "/dashboard/forms", icon: ClipboardList, roles: ["ADMIN", "MANAGER"] },

    // Admin + Manager + Trainer
    { label: "Check-In", href: "/dashboard/checkin", icon: QrCode, roles: ["ADMIN", "MANAGER", "TRAINER"] },

    // All roles (Calendar)
    { label: "Classes", href: "/dashboard/classes", icon: CalendarDays },

    // All roles (Billing)
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },

    // Admin + Manager + Trainer (not Member)
    { label: "Waivers", href: "/dashboard/waivers", icon: FileText, roles: ["ADMIN", "MANAGER", "TRAINER"] },

    // All roles
    { label: "Profile", href: "/dashboard/profile", icon: UserCircle },

    // All roles (Settings — Trainer/Member see limited tabs)
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
