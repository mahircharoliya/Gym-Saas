import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { cancelSubscription } from "@/lib/authorizenet";

export async function POST(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { memberProductId } = await req.json();
    if (!memberProductId) return errorResponse("memberProductId is required.");

    const mp = await prisma.memberProduct.findUnique({ where: { id: memberProductId } });
    if (!mp || mp.userId !== payload!.userId)
        return errorResponse("Membership not found.", 404);
    if (mp.status !== "ACTIVE")
        return errorResponse("Membership is not active.");

    if (mp.authNetSubscriptionId) {
        const result = await cancelSubscription(mp.authNetSubscriptionId);
        if (!result.success) return errorResponse(result.error ?? "Failed to cancel subscription.", 502);
    }

    await prisma.memberProduct.update({
        where: { id: memberProductId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return successResponse({ message: "Subscription cancelled." });
}
