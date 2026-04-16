import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) return errorResponse("Unauthorized.", 401);

        const payload = verifyToken(token);
        if (!payload) return errorResponse("Invalid or expired token.", 401);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: { tenant: true },
        });

        if (!user) return errorResponse("User not found.", 404);

        return successResponse({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            tenant: {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.slug,
            },
        });
    } catch (err) {
        console.error("[ME]", err);
        return errorResponse("Something went wrong.", 500);
    }
}
