import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;

    const waiver = await prisma.waiver.findUnique({ where: { id } });
    if (!waiver || waiver.tenantId !== payload!.tenantId)
        return errorResponse("Waiver not found.", 404);

    const body = await req.json();
    const updated = await prisma.waiver.update({ where: { id }, data: body });
    return successResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;
    const { id } = await params;

    const waiver = await prisma.waiver.findUnique({ where: { id } });
    if (!waiver || waiver.tenantId !== payload!.tenantId)
        return errorResponse("Waiver not found.", 404);

    await prisma.waiver.delete({ where: { id } });
    return successResponse({ message: "Waiver deleted." });
}
