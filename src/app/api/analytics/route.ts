import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "30"; // days
    const days = Math.min(365, Math.max(7, parseInt(range)));

    const tenantId = payload!.tenantId;
    const now = new Date();
    const rangeStart = new Date(now.getTime() - days * 86400000);
    const prevStart = new Date(rangeStart.getTime() - days * 86400000);

    // ── Member stats ──────────────────────────────────────────────────────────
    const [totalMembers, newMembers, prevNewMembers] = await Promise.all([
        prisma.user.count({ where: { tenantId, role: "MEMBER" } }),
        prisma.user.count({ where: { tenantId, role: "MEMBER", createdAt: { gte: rangeStart } } }),
        prisma.user.count({ where: { tenantId, role: "MEMBER", createdAt: { gte: prevStart, lt: rangeStart } } }),
    ]);

    // ── Active memberships ────────────────────────────────────────────────────
    const [activeMembers, cancelledInRange] = await Promise.all([
        prisma.memberProduct.count({ where: { tenantId, status: "ACTIVE" } }),
        prisma.memberProduct.count({ where: { tenantId, status: "CANCELLED", cancelledAt: { gte: rangeStart } } }),
    ]);

    // ── Revenue (sum of active product prices as proxy) ───────────────────────
    const activePlans = await prisma.memberProduct.findMany({
        where: { tenantId, status: "ACTIVE" },
        include: { product: { select: { price: true, billingInterval: true } } },
    });

    const mrr = activePlans.reduce((sum, mp) => {
        const price = Number(mp.product.price);
        const interval = mp.product.billingInterval;
        if (interval === "MONTHLY") return sum + price;
        if (interval === "YEARLY") return sum + price / 12;
        if (interval === "WEEKLY") return sum + price * 4.33;
        if (interval === "DAILY") return sum + price * 30;
        return sum; // ONCE not counted in MRR
    }, 0);

    const arr = mrr * 12;

    // ── Check-ins per day (sparkline data) ────────────────────────────────────
    const checkIns = await prisma.checkIn.findMany({
        where: { tenantId, createdAt: { gte: rangeStart } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    const checkInByDay: Record<string, number> = {};
    checkIns.forEach((ci) => {
        const key = ci.createdAt.toISOString().slice(0, 10);
        checkInByDay[key] = (checkInByDay[key] ?? 0) + 1;
    });

    // ── New members per day ───────────────────────────────────────────────────
    const newMemberRecords = await prisma.user.findMany({
        where: { tenantId, role: "MEMBER", createdAt: { gte: rangeStart } },
        select: { createdAt: true },
    });

    const membersByDay: Record<string, number> = {};
    newMemberRecords.forEach((u) => {
        const key = u.createdAt.toISOString().slice(0, 10);
        membersByDay[key] = (membersByDay[key] ?? 0) + 1;
    });

    // Build daily series for the range
    const dailySeries = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(rangeStart.getTime() + i * 86400000);
        const key = d.toISOString().slice(0, 10);
        dailySeries.push({
            date: key,
            checkIns: checkInByDay[key] ?? 0,
            newMembers: membersByDay[key] ?? 0,
        });
    }

    // ── Membership type breakdown ─────────────────────────────────────────────
    const typeBreakdown = await prisma.memberProduct.groupBy({
        by: ["productId"],
        where: { tenantId, status: "ACTIVE" },
        _count: true,
    });

    const productNames = await prisma.product.findMany({
        where: { id: { in: typeBreakdown.map((t) => t.productId) } },
        select: { id: true, name: true, membershipType: true },
    });

    const planBreakdown = typeBreakdown.map((t) => {
        const p = productNames.find((p) => p.id === t.productId);
        return { name: p?.name ?? "Unknown", count: t._count, type: p?.membershipType };
    });

    // ── Churn rate ────────────────────────────────────────────────────────────
    const churnRate = activeMembers > 0
        ? ((cancelledInRange / (activeMembers + cancelledInRange)) * 100).toFixed(1)
        : "0.0";

    // ── Growth rate ───────────────────────────────────────────────────────────
    const growthRate = prevNewMembers > 0
        ? (((newMembers - prevNewMembers) / prevNewMembers) * 100).toFixed(1)
        : newMembers > 0 ? "100.0" : "0.0";

    return successResponse({
        overview: {
            totalMembers,
            newMembers,
            activeMembers,
            cancelledInRange,
            mrr: mrr.toFixed(2),
            arr: arr.toFixed(2),
            churnRate,
            growthRate,
            totalCheckIns: checkIns.length,
        },
        dailySeries,
        planBreakdown,
        range: days,
    });
}
