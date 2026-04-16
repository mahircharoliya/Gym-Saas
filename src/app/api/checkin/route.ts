import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/checkin?date=YYYY-MM-DD  — list today's check-ins
export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.TRAINER);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);

    const checkIns = await prisma.checkIn.findMany({
        where: { tenantId: payload!.tenantId, createdAt: { gte: start, lte: end } },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return successResponse(checkIns);
}

// POST /api/checkin  — record a check-in
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.TRAINER);
    if (error) return error;

    const { userId, method = "MANUAL", note } = await req.json();
    if (!userId) return errorResponse("userId is required.");

    // Verify user belongs to this tenant
    const user = await prisma.user.findFirst({
        where: { id: userId, tenantId: payload!.tenantId },
        select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!user) return errorResponse("Member not found.", 404);

    // Validate active membership
    const activeMembership = await prisma.memberProduct.findFirst({
        where: {
            userId,
            tenantId: payload!.tenantId,
            status: "ACTIVE",
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ],
        },
        include: { product: { select: { name: true, membershipType: true } } },
    });

    if (!activeMembership) {
        return errorResponse("Member does not have an active membership.", 403);
    }

    // Decrement visit count for LIMITED_VISITS
    if (
        activeMembership.product.membershipType === "LIMITED_VISITS" &&
        activeMembership.visitsRemaining !== null &&
        activeMembership.visitsRemaining !== undefined
    ) {
        if (activeMembership.visitsRemaining <= 0) {
            return errorResponse("Member has no visits remaining.", 403);
        }
        await prisma.memberProduct.update({
            where: { id: activeMembership.id },
            data: { visitsRemaining: { decrement: 1 } },
        });
    }

    const checkIn = await prisma.checkIn.create({
        data: { tenantId: payload!.tenantId, userId, method, note },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
    });

    return successResponse({
        checkIn,
        membership: {
            plan: activeMembership.product.name,
            visitsRemaining: activeMembership.visitsRemaining,
        },
    }, 201);
}
