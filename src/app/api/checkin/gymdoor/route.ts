import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

const GYMDOOR_API_URL = process.env.GYMDOOR_API_URL ?? "https://api.gymdoor.io/v1";
const GYMDOOR_API_KEY = process.env.GYMDOOR_API_KEY ?? "";

// POST /api/checkin/gymdoor
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.TRAINER);
    if (error) return error;

    const { memberId } = await req.json();
    if (!memberId) return errorResponse("memberId is required.");

    // ── Call Gym Door API to verify access ────────────────────────────────────
    let gymDoorUserId: string | null = null;

    if (GYMDOOR_API_KEY) {
        try {
            const gdRes = await fetch(`${GYMDOOR_API_URL}/members/${memberId}/access`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GYMDOOR_API_KEY}`,
                },
                body: JSON.stringify({ facilityId: payload!.tenantId }),
            });

            if (!gdRes.ok) {
                const gdJson = await gdRes.json().catch(() => ({}));
                return errorResponse(gdJson.message ?? "Gym Door denied access.", 403);
            }

            const gdJson = await gdRes.json();
            gymDoorUserId = gdJson.userId ?? memberId;
        } catch {
            return errorResponse("Could not reach Gym Door API.", 502);
        }
    }

    // ── Find user in our DB by Gym Door member ID or our userId ───────────────
    const lookupId = gymDoorUserId ?? memberId;

    const user = await prisma.user.findFirst({
        where: {
            tenantId: payload!.tenantId,
            OR: [
                { id: lookupId },
                { email: lookupId },
            ],
        },
    });

    if (!user) return errorResponse("Member not found in system.", 404);

    // ── Validate active membership ────────────────────────────────────────────
    const activeMembership = await prisma.memberProduct.findFirst({
        where: {
            userId: user.id,
            tenantId: payload!.tenantId,
            status: "ACTIVE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: { product: { select: { name: true, membershipType: true } } },
    });

    if (!activeMembership) return errorResponse("Member does not have an active membership.", 403);

    // Decrement visits if LIMITED_VISITS
    if (
        activeMembership.product.membershipType === "LIMITED_VISITS" &&
        activeMembership.visitsRemaining !== null &&
        activeMembership.visitsRemaining !== undefined
    ) {
        if (activeMembership.visitsRemaining <= 0)
            return errorResponse("Member has no visits remaining.", 403);
        await prisma.memberProduct.update({
            where: { id: activeMembership.id },
            data: { visitsRemaining: { decrement: 1 } },
        });
    }

    // ── Record check-in ───────────────────────────────────────────────────────
    const checkIn = await prisma.checkIn.create({
        data: { tenantId: payload!.tenantId, userId: user.id, method: "GYMDOOR" },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    return successResponse({
        userId: user.id,
        checkIn,
        membership: { plan: activeMembership.product.name },
    }, 201);
}
