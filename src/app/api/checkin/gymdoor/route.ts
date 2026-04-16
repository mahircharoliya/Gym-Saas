import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { validateWellhubAccess } from "@/lib/wellhub";
import { Role } from "@prisma/client";

/**
 * POST /api/checkin/gymdoor
 *
 * Validates a member via Wellhub (Gympass) Access Control API,
 * then records the check-in in our DB.
 *
 * Body: { wellhubUserId } — the Wellhub user ID from the member's credential
 *
 * Flow:
 * 1. Call Wellhub API to validate access
 * 2. If allowed, find the matching user in our DB
 * 3. Validate active membership
 * 4. Record check-in with method = "GYMDOOR"
 */
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.TRAINER);
    if (error) return error;

    const { wellhubUserId, localUserId } = await req.json();

    if (!wellhubUserId && !localUserId)
        return errorResponse("wellhubUserId or localUserId is required.");

    // ── Step 1: Validate via Wellhub ──────────────────────────────────────────
    if (wellhubUserId) {
        const wellhubResult = await validateWellhubAccess(wellhubUserId);

        if (!wellhubResult.success) {
            return errorResponse(wellhubResult.error ?? "Wellhub API error.", 502);
        }

        if (!wellhubResult.allowed) {
            return errorResponse(
                wellhubResult.denialReason ?? "Access denied by Wellhub.",
                403
            );
        }
    }

    // ── Step 2: Find user in our DB ───────────────────────────────────────────
    const lookupId = localUserId ?? wellhubUserId;

    const user = await prisma.user.findFirst({
        where: {
            tenantId: payload!.tenantId,
            OR: [
                { id: lookupId },
                { email: lookupId },
            ],
        },
    });

    if (!user) {
        return errorResponse(
            "Member not found in system. They may need to register first.",
            404
        );
    }

    // ── Step 3: Validate active membership ───────────────────────────────────
    const activeMembership = await prisma.memberProduct.findFirst({
        where: {
            userId: user.id,
            tenantId: payload!.tenantId,
            status: "ACTIVE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
            product: { select: { name: true, membershipType: true } },
        },
    });

    if (!activeMembership) {
        return errorResponse("Member does not have an active membership.", 403);
    }

    // Decrement visits for LIMITED_VISITS
    if (
        activeMembership.product.membershipType === "LIMITED_VISITS" &&
        activeMembership.visitsRemaining !== null &&
        activeMembership.visitsRemaining !== undefined
    ) {
        if (activeMembership.visitsRemaining <= 0) {
            return errorResponse("Member has no visits remaining.", 403);
        }
        await prisma.memberProduct.update({
            where: { id: activeMembership.id },
            data: { visitsRemaining: { decrement: 1 } },
        });
    }

    // ── Step 4: Record check-in ───────────────────────────────────────────────
    const checkIn = await prisma.checkIn.create({
        data: {
            tenantId: payload!.tenantId,
            userId: user.id,
            method: "GYMDOOR",
            note: wellhubUserId ? `Wellhub ID: ${wellhubUserId}` : undefined,
        },
        include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
    });

    return successResponse({
        userId: user.id,
        checkIn,
        membership: {
            plan: activeMembership.product.name,
            visitsRemaining: activeMembership.visitsRemaining,
        },
        wellhubValidated: !!wellhubUserId,
    }, 201);
}
