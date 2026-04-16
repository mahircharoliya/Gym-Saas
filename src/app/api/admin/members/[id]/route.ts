import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";
import { ASSIGNABLE_ROLES } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

async function getMember(id: string, tenantId: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            memberProducts: {
                include: { product: true },
                orderBy: { activatedAt: "desc" },
            },
            signedWaivers: {
                include: { waiver: { select: { title: true } } },
                orderBy: { signedAt: "desc" },
            },
        },
    });
    if (!user || user.tenantId !== tenantId) return null;
    return user;
}

// GET /api/admin/members/:id
export async function GET(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;
    const member = await getMember(id, payload!.tenantId);
    if (!member) return errorResponse("Member not found.", 404);
    return successResponse(member);
}

// PATCH /api/admin/members/:id — update role / info
export async function PATCH(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;
    const member = await getMember(id, payload!.tenantId);
    if (!member) return errorResponse("Member not found.", 404);

    const { firstName, lastName, phone, role } = await req.json();

    if (role && !ASSIGNABLE_ROLES.includes(role as Role))
        return errorResponse("Invalid role.");

    const updated = await prisma.user.update({
        where: { id },
        data: { firstName, lastName, phone, ...(role ? { role } : {}) },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });
    return successResponse(updated);
}

// DELETE /api/admin/members/:id
export async function DELETE(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;
    const { id } = await params;
    const member = await getMember(id, payload!.tenantId);
    if (!member) return errorResponse("Member not found.", 404);
    if (member.id === payload!.userId) return errorResponse("Cannot delete your own account.");

    await prisma.user.delete({ where: { id } });
    return successResponse({ message: "Member deleted." });
}
