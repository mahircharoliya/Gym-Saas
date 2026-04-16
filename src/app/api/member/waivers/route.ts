import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";

// GET /api/member/waivers — signed waivers for current user
export async function GET(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const signed = await prisma.signedWaiver.findMany({
        where: { userId: payload!.userId },
        include: { waiver: { select: { title: true, body: true } } },
        orderBy: { signedAt: "desc" },
    });

    return successResponse(signed);
}
