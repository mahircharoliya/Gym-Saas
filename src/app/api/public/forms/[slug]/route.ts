import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

// Public — no auth required
export async function GET(_req: NextRequest, { params }: Params) {
    const { slug } = await params;

    const form = await prisma.signupForm.findFirst({
        where: { slug, isActive: true },
        include: {
            tenant: { select: { id: true, name: true, slug: true } },
            waivers: {
                orderBy: { order: "asc" },
                include: { waiver: { select: { id: true, title: true, body: true } } },
            },
        },
    });

    if (!form) return errorResponse("Signup form not found or inactive.", 404);

    // Fetch products for this form
    const products =
        form.productIds.length > 0
            ? await prisma.product.findMany({
                where: { id: { in: form.productIds }, status: "ACTIVE" },
                select: {
                    id: true, name: true, description: true,
                    membershipType: true, price: true, comparePrice: true,
                    billingInterval: true, visitLimit: true, durationDays: true,
                    discountPercent: true,
                },
            })
            : [];

    return successResponse({
        form: {
            id: form.id,
            name: form.name,
            description: form.description,
            slug: form.slug,
        },
        tenant: form.tenant,
        products,
        waivers: form.waivers.map((fw) => fw.waiver),
    });
}
