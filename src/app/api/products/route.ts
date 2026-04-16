import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/products
export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "ACTIVE";

    const products = await prisma.product.findMany({
        where: { tenantId: payload!.tenantId, status: status as "ACTIVE" | "ARCHIVED" },
        orderBy: { createdAt: "desc" },
    });

    return successResponse(products);
}

// POST /api/products
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const body = await req.json();
    const {
        name, description, membershipType, price, comparePrice,
        billingInterval, visitLimit, durationDays, discountPercent, discountEndsAt,
    } = body;

    if (!name || !membershipType || price === undefined)
        return errorResponse("name, membershipType, and price are required.");

    const product = await prisma.product.create({
        data: {
            tenantId: payload!.tenantId,
            name,
            description,
            membershipType,
            price,
            comparePrice,
            billingInterval: billingInterval ?? "ONCE",
            visitLimit,
            durationDays,
            discountPercent,
            discountEndsAt: discountEndsAt ? new Date(discountEndsAt) : undefined,
        },
    });

    return successResponse(product, 201);
}
