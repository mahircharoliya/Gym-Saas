import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// POST /api/admin/members/bulk  body: { action, ids }
// actions: delete | assign-role
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;

    const { action, ids, role } = await req.json();
    if (!action || !Array.isArray(ids) || ids.length === 0)
        return errorResponse("action and ids are required.");

    // Ensure all ids belong to this tenant
    const count = await prisma.user.count({
        where: { id: { in: ids }, tenantId: payload!.tenantId },
    });
    if (count !== ids.length) return errorResponse("One or more members not found.");

    if (action === "delete") {
        // Prevent self-deletion
        if (ids.includes(payload!.userId))
            return errorResponse("Cannot delete your own account.");
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
        return successResponse({ deleted: ids.length });
    }

    if (action === "assign-role") {
        if (!role) return errorResponse("role is required for assign-role action.");
        await prisma.user.updateMany({
            where: { id: { in: ids }, tenantId: payload!.tenantId },
            data: { role: role as Role },
        });
        return successResponse({ updated: ids.length });
    }

    return errorResponse("Unknown action.");
}
