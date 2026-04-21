import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
    try {
        const { firstName, lastName, email, password, gymSlug, role, phone, specialization, certifications, createNewGym, gymName } =
            await req.json();

        // ── Validation ──────────────────────────────────────────────────────────
        if (!firstName || !lastName || !email || !password) {
            return errorResponse("All fields are required.");
        }
        if (password.length < 8) {
            return errorResponse("Password must be at least 8 characters.");
        }

        const emailExists = await prisma.user.findFirst({ where: { email } });
        if (emailExists) {
            return errorResponse("An account with that email already exists.");
        }

        const hashedPassword = await hashPassword(password);
        let tenant;
        let user;

        // ── Option 1: Create new gym (for gym owners) ───────────────────────────
        if (createNewGym) {
            if (!gymName) {
                return errorResponse("Gym name is required to create a new gym.");
            }

            const slug = gymName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            const slugExists = await prisma.tenant.findUnique({ where: { slug } });
            if (slugExists) {
                return errorResponse("A gym with that name already exists. Try a different name.");
            }

            tenant = await prisma.tenant.create({
                data: {
                    name: gymName,
                    slug,
                    users: {
                        create: {
                            firstName,
                            lastName,
                            email,
                            hashedPassword,
                            role: "ADMIN", // Creator becomes admin
                            phone: phone || null,
                            specialization: specialization || null,
                            certifications: certifications || null,
                        },
                    },
                },
                include: { users: true },
            });

            user = tenant.users[0];
        }
        // ── Option 2: Join existing gym ─────────────────────────────────────────
        else {
            if (!gymSlug) {
                return errorResponse("Gym selection is required.");
            }

            tenant = await prisma.tenant.findUnique({ where: { slug: gymSlug } });
            if (!tenant) {
                return errorResponse("Gym not found. Please check the gym code.");
            }

            // Check if email already exists in this tenant
            const emailInTenant = await prisma.user.findFirst({
                where: { email, tenantId: tenant.id }
            });
            if (emailInTenant) {
                return errorResponse("An account with that email already exists in this gym.");
            }

            user = await prisma.user.create({
                data: {
                    tenantId: tenant.id,
                    firstName,
                    lastName,
                    email,
                    hashedPassword,
                    role: (role as "ADMIN" | "MANAGER" | "TRAINER" | "MEMBER") ?? "MEMBER",
                    phone: phone || null,
                    specialization: specialization || null,
                    certifications: certifications || null,
                },
            });
        }

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
