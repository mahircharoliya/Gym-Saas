import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// POST /api/classes/:id/book
export async function POST(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const { id } = await params;

    const gymClass = await prisma.gymClass.findUnique({ where: { id } });
    if (!gymClass || gymClass.tenantId !== payload!.tenantId)
        return errorResponse("Class not found.", 404);
    if (gymClass.status === "CANCELLED")
        return errorResponse("This class has been cancelled.");
    if (gymClass.startAt < new Date())
        return errorResponse("Cannot book a class that has already started.");

    // Check existing booking
    const existing = await prisma.classBooking.findUnique({
        where: { classId_userId: { classId: id, userId: payload!.userId } },
    });
    if (existing?.status === "CONFIRMED") return errorResponse("Already booked.");

    // Check capacity
    const confirmed = await prisma.classBooking.count({
        where: { classId: id, status: "CONFIRMED" },
    });

    const status = confirmed >= gymClass.capacity ? "WAITLISTED" : "CONFIRMED";

    const booking = await prisma.classBooking.upsert({
        where: { classId_userId: { classId: id, userId: payload!.userId } },
        create: { tenantId: payload!.tenantId, classId: id, userId: payload!.userId, status },
        update: { status, cancelledAt: null },
    });

    return successResponse({ booking, waitlisted: status === "WAITLISTED" }, 201);
}

// DELETE /api/classes/:id/book — cancel booking
export async function DELETE(req: NextRequest, { params }: Params) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const { id } = await params;

    const booking = await prisma.classBooking.findUnique({
        where: { classId_userId: { classId: id, userId: payload!.userId } },
    });
    if (!booking) return errorResponse("Booking not found.", 404);

    await prisma.classBooking.update({
        where: { classId_userId: { classId: id, userId: payload!.userId } },
        data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return successResponse({ message: "Booking cancelled." });
}
