import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

async function getClass(id: string, tenantId: string) {
    const c = await prisma.gymClass.findUnique({
        where: { id },
        include: {
            trainer: { select: { id: true, firstName: true, lastName: true } },
            bookings: {
                where: { status: "CONFIRMED" },
                include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
            },
        },
    });
    if (!c || c.tenantId !== tenantId) return null;
    return c;
}

export async function GET(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const { id } = await params;
    const c = await getClass(id, payload!.tenantId);
    if (!c) return errorResponse("Class not found.", 404);
    return successResponse(c);
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;
    const c = await getClass(id, payload!.tenantId);
    if (!c) return errorResponse("Class not found.", 404);

    const body = await req.json();
    const updated = await prisma.gymClass.update({
        where: { id },
        data: {
            ...body,
            startAt: body.startAt ? new Date(body.startAt) : undefined,
            endAt: body.endAt ? new Date(body.endAt) : undefined,
            trainerId: body.trainerId || null,
        },
        include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
    });
    return successResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;
    const c = await getClass(id, payload!.tenantId);
    if (!c) return errorResponse("Class not found.", 404);

    const { deleteAll } = await req.json().catch(() => ({ deleteAll: false }));

    if (deleteAll && c.recurringId) {
        await prisma.gymClass.deleteMany({
            where: { recurringId: c.recurringId, startAt: { gte: new Date() } },
        });
    } else {
        await prisma.gymClass.delete({ where: { id } });
    }
    return successResponse({ message: "Class deleted." });
}
