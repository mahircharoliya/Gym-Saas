import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

// GET /api/classes?start=&end=
export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const classes = await prisma.gymClass.findMany({
        where: {
            tenantId: payload!.tenantId,
            ...(start && end ? {
                startAt: { gte: new Date(start), lte: new Date(end) },
            } : {}),
        },
        include: {
            trainer: { select: { id: true, firstName: true, lastName: true } },
            bookings: { where: { status: "CONFIRMED" }, select: { id: true, userId: true } },
        },
        orderBy: { startAt: "asc" },
    });

    return successResponse(classes);
}

// POST /api/classes
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;

    const {
        name, description, location, color, capacity,
        trainerId, startAt, endAt, isRecurring, recurringDays, recurringWeeks,
    } = await req.json();

    if (!name || !startAt || !endAt) return errorResponse("name, startAt, endAt are required.");

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) return errorResponse("End time must be after start time.");

    // Single class
    if (!isRecurring) {
        const gymClass = await prisma.gymClass.create({
            data: {
                tenantId: payload!.tenantId,
                name, description, location,
                color: color ?? "#6366f1",
                capacity: capacity ?? 20,
                trainerId: trainerId || null,
                startAt: start, endAt: end,
            },
            include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
        });
        return successResponse(gymClass, 201);
    }

    // Recurring — create N weeks of instances
    const weeks = recurringWeeks ?? 4;
    const days: number[] = recurringDays ?? [start.getDay()];
    const recurringId = `rec_${Date.now()}`;
    const duration = end.getTime() - start.getTime();

    const instances = [];
    for (let w = 0; w < weeks; w++) {
        for (const day of days) {
            const base = new Date(start);
            base.setDate(base.getDate() + w * 7 + ((day - start.getDay() + 7) % 7));
            const instanceEnd = new Date(base.getTime() + duration);
            instances.push({
                tenantId: payload!.tenantId,
                name, description, location,
                color: color ?? "#6366f1",
                capacity: capacity ?? 20,
                trainerId: trainerId || null,
                startAt: base, endAt: instanceEnd,
                isRecurring: true, recurringId,
            });
        }
    }

    await prisma.gymClass.createMany({ data: instances });
    return successResponse({ created: instances.length, recurringId }, 201);
}
