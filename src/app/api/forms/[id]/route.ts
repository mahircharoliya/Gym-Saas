import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const { id } = await params;

    const form = await prisma.signupForm.findUnique({
        where: { id },
        include: { waivers: { include: { waiver: true }, orderBy: { order: "asc" } } },
    });
    if (!form || form.tenantId !== payload!.tenantId)
        return errorResponse("Form not found.", 404);

    return successResponse(form);
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;

    const form = await prisma.signupForm.findUnique({ where: { id } });
    if (!form || form.tenantId !== payload!.tenantId)
        return errorResponse("Form not found.", 404);

    const { name, description, productIds, waiverIds, isActive } = await req.json();

    const updated = await prisma.$transaction(async (tx) => {
        if (waiverIds !== undefined) {
            await tx.formWaiver.deleteMany({ where: { signupFormId: id } });
            if (waiverIds.length > 0) {
                await tx.formWaiver.createMany({
                    data: waiverIds.map((wId: string, i: number) => ({
                        signupFormId: id, waiverId: wId, order: i,
                    })),
                });
            }
        }
        return tx.signupForm.update({
            where: { id },
            data: { name, description, productIds, isActive },
            include: { waivers: { include: { waiver: true } } },
        });
    });

    return successResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;
    const { id } = await params;

    const form = await prisma.signupForm.findUnique({ where: { id } });
    if (!form || form.tenantId !== payload!.tenantId)
        return errorResponse("Form not found.", 404);

    await prisma.signupForm.delete({ where: { id } });
    return successResponse({ message: "Form deleted." });
}
