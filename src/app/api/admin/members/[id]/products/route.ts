import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/members/:id/products — assign product to member
export async function POST(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;

    const member = await prisma.user.findFirst({ where: { id, tenantId: payload!.tenantId } });
    if (!member) return errorResponse("Member not found.", 404);

    const { productId } = await req.json();
    if (!productId) return errorResponse("productId is required.");

    const product = await prisma.product.findFirst({
        where: { id: productId, tenantId: payload!.tenantId },
    });
    if (!product) return errorResponse("Product not found.", 404);

    const expiresAt = product.durationDays
        ? new Date(Date.now() + product.durationDays * 86400000)
        : undefined;

    const mp = await prisma.memberProduct.create({
        data: {
            tenantId: payload!.tenantId,
            userId: id,
            productId,
            visitsRemaining: product.visitLimit ?? undefined,
            expiresAt,
        },
        include: { product: { select: { name: true, price: true, billingInterval: true, membershipType: true } } },
    });

    return successResponse(mp, 201);
}
