import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") ?? "30");
    const tenantId = payload!.tenantId;
    const now = new Date();
    const rangeStart = new Date(now.getTime() - range * 86400000);
    const prevStart = new Date(rangeStart.getTime() - range * 86400000);

    // ── Lifetime metrics ──────────────────────────────────────────────────────
    const totalActive = await prisma.memberProduct.count({
        where: { tenantId, status: "ACTIVE" },
    });

    // Average membership duration (days) for all memberships
    const allMemberships = await prisma.memberProduct.findMany({
        where: { tenantId },
        select: { activatedAt: true, cancelledAt: true, expiresAt: true, status: true },
    });

    const durations = allMemberships.map((m) => {
        const end = m.cancelledAt ?? m.expiresAt ?? now;
        return (end.getTime() - m.activatedAt.getTime()) / 86400000;
    });
    const avgDuration = durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    // Plan breakdown
    const planBreakdown = await prisma.memberProduct.groupBy({
        by: ["productId"],
        where: { tenantId, status: "ACTIVE" },
        _count: true,
    });
    const products = await prisma.product.findMany({
        where: { id: { in: planBreakdown.map((p) => p.productId) } },
        select: { id: true, name: true, membershipType: true, billingInterval: true },
    });
    const planData = planBreakdown
        .map((p) => ({
            ...products.find((pr) => pr.id === p.productId),
            count: p._count,
        }))
        .sort((a, b) => b.count - a.count);

    const mostPopularPlan = planData[0]?.name ?? "—";

    // ── Date-range metrics ────────────────────────────────────────────────────
    const [newMemberships, prevNewMemberships, cancelledInRange] = await Promise.all([
        prisma.memberProduct.count({ where: { tenantId, activatedAt: { gte: rangeStart } } }),
        prisma.memberProduct.count({ where: { tenantId, activatedAt: { gte: prevStart, lt: rangeStart } } }),
        prisma.memberProduct.count({ where: { tenantId, status: "CANCELLED", cancelledAt: { gte: rangeStart } } }),
    ]);

    const churnRate = totalActive > 0
        ? ((cancelledInRange / (totalActive + cancelledInRange)) * 100).toFixed(1)
        : "0.0";

    const growthRate = prevNewMemberships > 0
        ? (((newMemberships - prevNewMemberships) / prevNewMemberships) * 100).toFixed(1)
        : newMemberships > 0 ? "100.0" : "0.0";

    // Renewal rate — members who had a membership expire and got a new one
    const renewals = await prisma.memberProduct.count({
        where: {
            tenantId,
            activatedAt: { gte: rangeStart },
            user: {
                memberProducts: {
                    some: {
                        status: { in: ["CANCELLED", "EXPIRED"] },
                        cancelledAt: { lt: rangeStart },
                    },
                },
            },
        },
    });
    const renewalRate = newMemberships > 0
        ? ((renewals / newMemberships) * 100).toFixed(1)
        : "0.0";

    // Inactive members — no check-in in last X days
    const inactiveThreshold = new Date(now.getTime() - range * 86400000);
    const activeUserIds = await prisma.checkIn.findMany({
        where: { tenantId, createdAt: { gte: inactiveThreshold } },
        select: { userId: true },
        distinct: ["userId"],
    });
    const activeIds = activeUserIds.map((c) => c.userId);
    const inactiveMembers = await prisma.user.count({
        where: {
            tenantId, role: "MEMBER",
            id: { notIn: activeIds },
            memberProducts: { some: { status: "ACTIVE" } },
        },
    });

    // Daily new memberships series
    const newMembershipRecords = await prisma.memberProduct.findMany({
        where: { tenantId, activatedAt: { gte: rangeStart } },
        select: { activatedAt: true },
    });
    const byDay: Record<string, number> = {};
    newMembershipRecords.forEach((m) => {
        const key = m.activatedAt.toISOString().slice(0, 10);
        byDay[key] = (byDay[key] ?? 0) + 1;
    });
    const dailySeries = Array.from({ length: range }, (_, i) => {
        const d = new Date(rangeStart.getTime() + i * 86400000);
        const key = d.toISOString().slice(0, 10);
        return { date: key, newMemberships: byDay[key] ?? 0 };
    });

    return successResponse({
        lifetime: { totalActive, avgDuration, mostPopularPlan, planBreakdown: planData },
        range: {
            newMemberships, cancelledInRange, churnRate,
            growthRate, renewalRate, inactiveMembers,
        },
        dailySeries,
        days: range,
    });
}
