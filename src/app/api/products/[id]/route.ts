import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

async function getProduct(id: string, tenantId: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    if (product.tenantId !== tenantId) return null;
    return product;
}

// GET /api/products/:id
export async function GET(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const { id } = await params;
    const product = await getProduct(id, payload!.tenantId);
    if (!product) return errorResponse("Product not found.", 404);
    return successResponse(product);
}

// PATCH /api/products/:id
export async function PATCH(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;
    const product = await getProduct(id, payload!.tenantId);
    if (!product) return errorResponse("Product not found.", 404);

    const body = await req.json();
    const updated = await prisma.product.update({
        where: { id },
        data: {
            ...body,
            discountEndsAt: body.discountEndsAt ? new Date(body.discountEndsAt) : undefined,
        },
    });
    return successResponse(updated);
}

// DELETE /api/products/:id — soft delete (archive)
export async function DELETE(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;
    const { id } = await params;
    const product = await getProduct(id, payload!.tenantId);
    if (!product) return errorResponse("Product not found.", 404);

    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    return successResponse({ message: "Product archived." });
}
