import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { createCustomerProfile } from "@/lib/authorizenet";

// POST /api/member/payment-method — save/update card via Authorize.net customer profile
export async function POST(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { cardNumber, expirationDate, cvv } = await req.json();
    if (!cardNumber || !expirationDate || !cvv)
        return errorResponse("Card details are required.");

    const user = await prisma.user.findUnique({ where: { id: payload!.userId } });
    if (!user) return errorResponse("User not found.", 404);

    const result = await createCustomerProfile({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expirationDate,
        cvv,
    });

    if (!result.success) return errorResponse(result.error ?? "Failed to save payment method.", 502);

    // Store customer profile ID on all active memberships
    await prisma.memberProduct.updateMany({
        where: { userId: payload!.userId, status: "ACTIVE" },
        data: { authNetCustomerId: result.customerProfileId },
    });

    return successResponse({ customerProfileId: result.customerProfileId });
}
