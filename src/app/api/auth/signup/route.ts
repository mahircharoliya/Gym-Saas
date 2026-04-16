import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
    try {
        const { firstName, lastName, email, password, confirmPassword, gymName, role } =
            await req.json();

        // ── Validation ──────────────────────────────────────────────────────────
        if (!firstName || !lastName || !email || !password || !gymName) {
            return errorResponse("All fields are required.");
        }
        if (password !== confirmPassword) {
            return errorResponse("Passwords do not match.");
        }
        if (password.length < 8) {
            return errorResponse("Password must be at least 8 characters.");
        }

        // ── Slug from gym name ───────────────────────────────────────────────────
        const slug = gymName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const slugExists = await prisma.tenant.findUnique({ where: { slug } });
        if (slugExists) {
            return errorResponse("A gym with that name already exists. Try a different name.");
        }

        const emailExists = await prisma.user.findFirst({ where: { email } });
        if (emailExists) {
            return errorResponse("An account with that email already exists.");
        }

        // ── Create tenant + admin user ───────────────────────────────────────────
        const hashedPassword = await hashPassword(password);

        const tenant = await prisma.tenant.create({
            data: {
                name: gymName,
                slug,
                users: {
                    create: {
                        firstName,
                        lastName,
                        email,
                        hashedPassword,
                        role: (role as "ADMIN" | "MANAGER" | "TRAINER" | "MEMBER") ?? "ADMIN",
                    },
                },
            },
            include: { users: true },
        });

        const user = tenant.users[0];
        const token = signToken({
            userId: user.id,
            tenantId: tenant.id,
            email: user.email,
            role: user.role,
        });

        return successResponse(
            {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
            },
            201
        );
    } catch (err) {
        console.error("[SIGNUP]", err);
        return errorResponse("Something went wrong. Please try again.", 500);
    }
}
