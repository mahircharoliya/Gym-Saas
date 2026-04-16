import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { ASSIGNABLE_ROLES } from "@/lib/rbac";
import { Role } from "@prisma/client";
import crypto from "crypto";

// GET /api/invites — list pending invites for tenant
export async function GET(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;

    const invites = await prisma.invite.findMany({
        where: { tenantId: payload!.tenantId, acceptedAt: null },
        orderBy: { createdAt: "desc" },
        include: { inviter: { select: { firstName: true, lastName: true } } },
    });

    return successResponse(invites);
}

// POST /api/invites — send invite
export async function POST(req: NextRequest) {
    const { error, payload } = requireRole(req, Role.ADMIN);
    if (error) return error;

    const { email, role } = await req.json();

    if (!email || !role) return errorResponse("Email and role are required.");
    if (!ASSIGNABLE_ROLES.includes(role as Role))
        return errorResponse("Invalid role.");

    // Check not already a member
    const existing = await prisma.user.findFirst({
        where: { tenantId: payload!.tenantId, email },
    });
    if (existing) return errorResponse("User is already a member of this gym.");

    // Check no pending invite
    const pending = await prisma.invite.findFirst({
        where: { tenantId: payload!.tenantId, email, acceptedAt: null },
    });
    if (pending) return errorResponse("An invite has already been sent to this email.");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.invite.create({
        data: {
            tenantId: payload!.tenantId,
            email,
            role: role as Role,
            token,
            invitedBy: payload!.userId,
            expiresAt,
        },
    });

    // TODO: send invite email (Step 8 — email integration)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`;
    console.log(`[INVITE] ${email} → ${inviteUrl}`);

    return successResponse({ invite, inviteUrl }, 201);
}
