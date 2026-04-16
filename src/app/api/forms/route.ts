import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const forms = await prisma.signupForm.findMany({
        where: { tenantId: payload!.tenantId },
        include: { waivers: { include: { waiver: true } } },
        orderBy: { createdAt: "desc" },
    });
    return successResponse(forms);
}

export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { name, description, productIds, waiverIds } = await req.json();
    if (!name) return errorResponse("Form name is required.");

    // Generate slug from name
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const count = await prisma.signupForm.count({
        where: { tenantId: payload!.tenantId, slug: { startsWith: baseSlug } },
    });
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    const form = await prisma.signupForm.create({
        data: {
            tenantId: payload!.tenantId,
            name,
            slug,
            description,
            productIds: productIds ?? [],
            waivers: waiverIds?.length
                ? { create: waiverIds.map((wId: string, i: number) => ({ waiverId: wId, order: i })) }
                : undefined,
        },
        include: { waivers: { include: { waiver: true } } },
    });
    return successResponse(form, 201);
}
