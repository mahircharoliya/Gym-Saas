import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
    const { token, firstName, lastName, password, confirmPassword } =
        await req.json();

    if (!token || !firstName || !lastName || !password)
        return errorResponse("All fields are required.");
    if (password !== confirmPassword)
        return errorResponse("Passwords do not match.");
    if (password.length < 8)
        return errorResponse("Password must be at least 8 characters.");

    const invite = await prisma.invite.findUnique({ where: { token } });

    if (!invite) return errorResponse("Invalid invite link.", 404);
    if (invite.acceptedAt) return errorResponse("This invite has already been used.");
    if (invite.expiresAt < new Date()) return errorResponse("This invite has expired.");

    const existing = await prisma.user.findFirst({
        where: { tenantId: invite.tenantId, email: invite.email },
    });
    if (existing) return errorResponse("An account with this email already exists.");

    const hashedPassword = await hashPassword(password);

    const [user] = await prisma.$transaction([
        prisma.user.create({
            data: {
                tenantId: invite.tenantId,
                email: invite.email,
                hashedPassword,
                firstName,
                lastName,
                role: invite.role,
            },
        }),
        prisma.invite.update({
            where: { id: invite.id },
            data: { acceptedAt: new Date() },
        }),
    ]);

    const tenant = await prisma.tenant.findUnique({ where: { id: invite.tenantId } });

    const jwtToken = signToken({
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
    });

    return successResponse({
        token: jwtToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        tenant: { id: tenant!.id, name: tenant!.name, slug: tenant!.slug },
    });
}
