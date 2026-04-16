import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return errorResponse("Email and password are required.");
        }

        const user = await prisma.user.findFirst({
            where: { email },
            include: { tenant: true },
        });

        if (!user) {
            return errorResponse("Invalid email or password.", 401);
        }

        const valid = await verifyPassword(password, user.hashedPassword);
        if (!valid) {
            return errorResponse("Invalid email or password.", 401);
        }

        const token = signToken({
            userId: user.id,
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
        });

        return successResponse({
            token,
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
        console.error("[LOGIN]", err);
        return errorResponse("Something went wrong. Please try again.", 500);
    }
}
