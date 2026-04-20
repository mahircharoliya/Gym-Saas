import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { successResponse } from "@/lib/api";

// GET /api/member/memberships — active + past plans
export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const memberships = await prisma.memberProduct.findMany({
        where: { userId: payload!.userId },
        include: {
            product: {
                select: {
                    name: true, membershipType: true, price: true,
                    billingInterval: true, visitLimit: true, durationDays: true,
                },
            },
        },
        orderBy: { activatedAt: "desc" },
    });

    return successResponse(memberships);
}
