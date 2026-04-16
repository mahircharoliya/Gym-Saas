import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";

// GET /api/member/profile
export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const user = await prisma.user.findUnique({
        where: { id: payload!.userId },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            phone: true, role: true, createdAt: true,
        },
    });
    if (!user) return errorResponse("User not found.", 404);
    return successResponse(user);
}

// PATCH /api/member/profile
export async function PATCH(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { firstName, lastName, phone } = await req.json();
    if (!firstName || !lastName) return errorResponse("First and last name are required.");

    const user = await prisma.user.update({
        where: { id: payload!.userId },
        data: { firstName, lastName, phone },
        select: {
            id: true, email: true, firstName: true, lastName: true,
            phone: true, role: true,
        },
    });
    return successResponse(user);
}
