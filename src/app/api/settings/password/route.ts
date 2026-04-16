import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { verifyPassword, hashPassword } from "@/lib/auth";

// POST /api/settings/password
export async function POST(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword)
        return errorResponse("All fields are required.");
    if (newPassword !== confirmPassword)
        return errorResponse("New passwords do not match.");
    if (newPassword.length < 8)
        return errorResponse("Password must be at least 8 characters.");

    const user = await prisma.user.findUnique({ where: { id: payload!.userId } });
    if (!user?.hashedPassword) return errorResponse("Cannot change password for this account.");

    const valid = await verifyPassword(currentPassword, user.hashedPassword);
    if (!valid) return errorResponse("Current password is incorrect.", 401);

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: payload!.userId }, data: { hashedPassword: hashed } });

    return successResponse({ message: "Password updated." });
}
