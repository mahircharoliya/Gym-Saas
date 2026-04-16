import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/settings
export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const tenant = await prisma.tenant.findUnique({
        where: { id: payload!.tenantId },
        select: {
            id: true, name: true, slug: true, domain: true,
            logoUrl: true, address: true, phone: true, email: true,
            timezone: true, emailNotifications: true, smsNotifications: true,
        },
    });
    if (!tenant) return errorResponse("Tenant not found.", 404);
    return successResponse(tenant);
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;

    const {
        name, domain, logoUrl, address, phone, email,
        timezone, emailNotifications, smsNotifications,
    } = await req.json();

    if (!name) return errorResponse("Gym name is required.");

    // Validate domain uniqueness if changed
    if (domain) {
        const existing = await prisma.tenant.findFirst({
            where: { domain, id: { not: payload!.tenantId } },
        });
        if (existing) return errorResponse("That domain is already in use.");
    }

    const tenant = await prisma.tenant.update({
        where: { id: payload!.tenantId },
        data: {
            name, domain: domain || null, logoUrl, address,
            phone, email, timezone,
            emailNotifications, smsNotifications,
        },
        select: {
            id: true, name: true, slug: true, domain: true,
            logoUrl: true, address: true, phone: true, email: true,
            timezone: true, emailNotifications: true, smsNotifications: true,
        },
    });

    return successResponse(tenant);
}
