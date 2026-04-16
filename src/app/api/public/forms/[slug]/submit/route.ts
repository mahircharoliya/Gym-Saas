import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
    const { slug } = await params;
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;

    const form = await prisma.signupForm.findFirst({
        where: { slug, isActive: true },
        include: { waivers: true },
    });
    if (!form) return errorResponse("Form not found or inactive.", 404);

    const { firstName, lastName, email, password, productId, acceptedWaiverIds } =
        await req.json();

    if (!firstName || !lastName || !email || !password)
        return errorResponse("All fields are required.");
    if (password.length < 8)
        return errorResponse("Password must be at least 8 characters.");

    // Check email not already used in this tenant
    const existing = await prisma.user.findFirst({
        where: { tenantId: form.tenantId, email },
    });
    if (existing) return errorResponse("An account with this email already exists.");

    // Validate product belongs to this form
    if (productId && !form.productIds.includes(productId))
        return errorResponse("Invalid product selection.");

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
            data: {
                tenantId: form.tenantId,
                email,
                hashedPassword,
                firstName,
                lastName,
                role: "MEMBER",
            },
        });

        // Assign product if selected
        if (productId) {
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (product) {
                const expiresAt =
                    product.durationDays
                        ? new Date(Date.now() + product.durationDays * 86400000)
                        : undefined;
                await tx.memberProduct.create({
                    data: {
                        tenantId: form.tenantId,
                        userId: user.id,
                        productId,
                        visitsRemaining: product.visitLimit ?? undefined,
                        expiresAt,
                    },
                });
            }
        }

        // Record signed waivers
        if (acceptedWaiverIds?.length) {
            await tx.signedWaiver.createMany({
                data: acceptedWaiverIds.map((wId: string) => ({
                    tenantId: form.tenantId,
                    userId: user.id,
                    waiverId: wId,
                    ipAddress: ip,
                })),
                skipDuplicates: true,
            });
        }

        return user;
    });

    const tenant = await prisma.tenant.findUnique({ where: { id: form.tenantId } });

    const token = signToken({
        userId: result.id,
        tenantId: result.tenantId,
        email: result.email,
        role: result.role,
    });

    return successResponse({
        token,
        user: {
            id: result.id,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            role: result.role,
        },
        tenant: { id: tenant!.id, name: tenant!.name, slug: tenant!.slug },
    }, 201);
}
