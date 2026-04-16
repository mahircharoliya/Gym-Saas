import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const waivers = await prisma.waiver.findMany({
        where: { tenantId: payload!.tenantId },
        orderBy: { createdAt: "desc" },
    });
    return successResponse(waivers);
}

export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const { title, body } = await req.json();
    if (!title || !body) return errorResponse("Title and body are required.");

    const waiver = await prisma.waiver.create({
        data: { tenantId: payload!.tenantId, title, body },
    });
    return successResponse(waiver, 201);
}
