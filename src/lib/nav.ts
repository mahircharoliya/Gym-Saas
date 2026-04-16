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
    ShieldCheck,
} from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Members", href: "/dashboard/members", icon: Users, roles: ["ADMIN", "MANAGER"] },
    { label: "Products", href: "/dashboard/products", icon: Dumbbell, roles: ["ADMIN", "MANAGER"] },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["ADMIN"] },
    { label: "Forms", href: "/dashboard/forms", icon: ClipboardList, roles: ["ADMIN", "MANAGER"] },
    { label: "Check-In", href: "/dashboard/checkin", icon: QrCode, roles: ["ADMIN", "MANAGER", "TRAINER"] },
    { label: "Classes", href: "/dashboard/classes", icon: CalendarDays },
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { label: "Waivers", href: "/dashboard/waivers", icon: FileText, roles: ["ADMIN", "MANAGER", "TRAINER"] },
    { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Super Admin", href: "/dashboard/super-admin", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
];
