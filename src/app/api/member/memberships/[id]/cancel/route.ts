import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// POST /api/member/memberships/:id/cancel
export async function POST(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { id } = await params;
    const membership = await prisma.memberProduct.findUnique({ where: { id } });

    if (!membership || membership.userId !== payload!.userId)
        return errorResponse("Membership not found.", 404);
    if (membership.status !== "ACTIVE")
        return errorResponse("This membership is not active.");

    const updated = await prisma.memberProduct.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    // TODO: cancel Authorize.net subscription (Step 11)

    return successResponse(updated);
}
