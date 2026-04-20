import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") ?? "30");
    const tenantId = payload!.tenantId;
    const now = new Date();
    const rangeStart = new Date(now.getTime() - range * 86400000);

    // All active memberships with product prices
    const activePlans = await prisma.memberProduct.findMany({
        where: { tenantId, status: "ACTIVE" },
        include: { product: { select: { price: true, billingInterval: true, name: true, membershipType: true } } },
    });

    // All memberships ever
    const allPlans = await prisma.memberProduct.findMany({
        where: { tenantId },
        include: { product: { select: { price: true, billingInterval: true, name: true } } },
    });

    // ── MRR ───────────────────────────────────────────────────────────────────
    const mrr = activePlans.reduce((sum, mp) => {
        const price = Number(mp.product.price);
        const interval = mp.product.billingInterval;
        if (interval === "MONTHLY") return sum + price;
        if (interval === "YEARLY") return sum + price / 12;
        if (interval === "WEEKLY") return sum + price * 4.33;
        if (interval === "DAILY") return sum + price * 30;
        return sum;
    }, 0);

    const arr = mrr * 12;

    // ── Lifetime revenue (sum of all one-time + recurring payments as proxy) ──
    const lifetimeRevenue = allPlans.reduce((sum, mp) => sum + Number(mp.product.price), 0);

    // ── LTV ───────────────────────────────────────────────────────────────────
    const totalMembers = await prisma.user.count({ where: { tenantId, role: "MEMBER" } });
    const ltv = totalMembers > 0 ? (lifetimeRevenue / totalMembers).toFixed(2) : "0.00";

    // ── Revenue by membership type ────────────────────────────────────────────
    const revenueByType: Record<string, number> = {};
    allPlans.forEach((mp) => {
        const type = mp.product.name;
        revenueByType[type] = (revenueByType[type] ?? 0) + Number(mp.product.price);
    });
    const revenueByTypeArr = Object.entries(revenueByType)
        .map(([name, revenue]) => ({ name, revenue: revenue.toFixed(2) }))
        .sort((a, b) => Number(b.revenue) - Number(a.revenue));

    // ── Range metrics ─────────────────────────────────────────────────────────
    const rangeActivations = await prisma.memberProduct.findMany({
        where: { tenantId, activatedAt: { gte: rangeStart } },
        include: { product: { select: { price: true } } },
    });

    const totalRevenue = rangeActivations.reduce((sum, mp) => sum + Number(mp.product.price), 0);

    const rangeUsers = await prisma.user.count({
        where: { tenantId, role: "MEMBER", createdAt: { gte: rangeStart } },
    });
    const arpu = rangeUsers > 0 ? (totalRevenue / rangeUsers).toFixed(2) : "0.00";

    // Refunds in range (cancelled memberships as proxy)
    const refunds = await prisma.memberProduct.count({
        where: { tenantId, status: "CANCELLED", cancelledAt: { gte: rangeStart } },
    });

    // Daily revenue series
    const byDay: Record<string, number> = {};
    rangeActivations.forEach((mp) => {
        const key = mp.activatedAt.toISOString().slice(0, 10);
        byDay[key] = (byDay[key] ?? 0) + Number(mp.product.price);
    });
    const dailySeries = Array.from({ length: range }, (_, i) => {
        const d = new Date(rangeStart.getTime() + i * 86400000);
        const key = d.toISOString().slice(0, 10);
        return { date: key, revenue: byDay[key] ?? 0 };
    });

    return successResponse({
        lifetime: {
            lifetimeRevenue: lifetimeRevenue.toFixed(2),
            ltv,
            revenueByType: revenueByTypeArr,
        },
        range: {
            totalRevenue: totalRevenue.toFixed(2),
            mrr: mrr.toFixed(2),
            arr: arr.toFixed(2),
            arpu,
            refunds,
            failedPayments: 0, // requires Authorize.net webhook integration
            outstandingPayments: 0,
        },
        dailySeries,
        days: range,
    });
}
