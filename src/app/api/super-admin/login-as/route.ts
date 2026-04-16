import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { signToken } from "@/lib/auth";
import { Role } from "@prisma/client";

// POST /api/super-admin/login-as  body: { userId }
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.SUPER_ADMIN);
    if (error) return error;

    const { userId } = await req.json();
    if (!userId) return errorResponse("userId is required.");

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: { select: { id: true, name: true, slug: true } } },
    });
    if (!user) return errorResponse("User not found.", 404);

    // Issue a token for the target user (impersonation)
    const token = signToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
    });

    return successResponse({
        token,
        user: {
            id: user.id, email: user.email,
            firstName: user.firstName, lastName: user.lastName, role: user.role,
        },
        tenant: user.tenant,
        impersonatedBy: payload!.userId,
    });
}
