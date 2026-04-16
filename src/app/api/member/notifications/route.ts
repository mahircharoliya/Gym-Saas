import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const user = await prisma.user.findUnique({
        where: { id: payload!.userId },
        select: { emailReminders: true, smsReminders: true },
    });
    return successResponse(user);
}

export async function PATCH(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;
    const { emailReminders, smsReminders } = await req.json();
    const user = await prisma.user.update({
        where: { id: payload!.userId },
        data: { emailReminders, smsReminders },
        select: { emailReminders: true, smsReminders: true },
    });
    return successResponse(user);
}
