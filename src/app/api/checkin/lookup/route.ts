import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/checkin/lookup?q=  — search members for manual check-in
export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.TRAINER);
    if (error) return error;

    const q = new URL(req.url).searchParams.get("q") ?? "";
    if (q.length < 2) return successResponse([]);

    const users = await prisma.user.findMany({
        where: {
            tenantId: payload!.tenantId,
            OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
            ],
        },
        select: {
            id: true, firstName: true, lastName: true, email: true,
            memberProducts: {
                where: { status: "ACTIVE" },
                select: { id: true, visitsRemaining: true, product: { select: { name: true, membershipType: true } } },
                take: 1,
            },
        },
        take: 8,
    });

    return successResponse(users);
}
