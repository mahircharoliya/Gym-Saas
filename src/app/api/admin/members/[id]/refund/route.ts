import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/members/:id/refund  body: { memberProductId, transactionId?, amount? }
export async function POST(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;

    const member = await prisma.user.findFirst({ where: { id, tenantId: payload!.tenantId } });
    if (!member) return errorResponse("Member not found.", 404);

    const { memberProductId, transactionId, amount } = await req.json();
    if (!memberProductId) return errorResponse("memberProductId is required.");

    const mp = await prisma.memberProduct.findUnique({ where: { id: memberProductId } });
    if (!mp || mp.userId !== id) return errorResponse("Membership not found.", 404);

    // Process Authorize.net refund if transaction details provided
    if (transactionId && amount) {
        const { refundTransaction } = await import("@/lib/authorizenet");
        const result = await refundTransaction(transactionId, Number(amount));
        if (!result.success) return errorResponse(result.error ?? "Refund failed.", 502);
    }

    await prisma.memberProduct.update({
        where: { id: memberProductId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return successResponse({ message: "Membership cancelled" + (transactionId ? " and refund processed." : ".") });
}
