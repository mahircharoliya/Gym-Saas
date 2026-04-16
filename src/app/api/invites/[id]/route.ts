import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// DELETE /api/invites/:id — revoke invite
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;

    const { id } = await params;

    const invite = await prisma.invite.findUnique({ where: { id } });
    if (!invite) return errorResponse("Invite not found.", 404);
    if (invite.tenantId !== payload!.tenantId)
        return errorResponse("Forbidden.", 403);

    await prisma.invite.delete({ where: { id } });
    return successResponse({ message: "Invite revoked." });
}
