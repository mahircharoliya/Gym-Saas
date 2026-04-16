import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { chargeCard, createSubscription } from "@/lib/authorizenet";

export async function POST(req: NextRequest) {
    const { error, payload } = requireAuth(req);
    if (error) return error;

    const { productId, cardNumber, expirationDate, cvv } = await req.json();

    if (!productId || !cardNumber || !expirationDate || !cvv)
        return errorResponse("productId, cardNumber, expirationDate, and cvv are required.");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.tenantId !== payload!.tenantId)
        return errorResponse("Product not found.", 404);

    const user = await prisma.user.findUnique({ where: { id: payload!.userId } });
    if (!user) return errorResponse("User not found.", 404);

    const amount = Number(product.price);
    const isRecurring = product.billingInterval !== "ONCE";

    let transactionId: string | undefined;
    let subscriptionId: string | undefined;

    if (!isRecurring) {
        // One-time charge
        const result = await chargeCard({
            cardNumber, expirationDate, cvv, amount,
            description: product.name,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });
        if (!result.success) return errorResponse(result.error ?? "Payment failed.", 402);
        transactionId = result.transactionId;
    } else {
        // Recurring subscription
        const intervalMap: Record<string, { unit: "months" | "days"; length: number }> = {
            MONTHLY: { unit: "months", length: 1 },
            YEARLY: { unit: "months", length: 12 },
            WEEKLY: { unit: "days", length: 7 },
            DAILY: { unit: "days", length: 1 },
        };
        const interval = intervalMap[product.billingInterval] ?? { unit: "months", length: 1 };

        // Total occurrences: ongoing = 9999, limited = calculate from durationDays
        const totalOccurrences = product.durationDays
            ? Math.ceil(product.durationDays / (interval.unit === "months" ? 30 : 1))
            : 9999;

        const result = await createSubscription({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            cardNumber, expirationDate, cvv,
            amount,
            intervalUnit: interval.unit,
            intervalLength: interval.length,
            totalOccurrences,
            startDate: new Date().toISOString().slice(0, 10),
            name: product.name,
        });
        if (!result.success) return errorResponse(result.error ?? "Subscription failed.", 402);
        subscriptionId = result.subscriptionId;
    }

    // Create MemberProduct record
    const expiresAt = product.durationDays
        ? new Date(Date.now() + product.durationDays * 86400000)
        : undefined;

    const memberProduct = await prisma.memberProduct.create({
        data: {
            tenantId: payload!.tenantId,
            userId: payload!.userId,
            productId,
            visitsRemaining: product.visitLimit ?? undefined,
            expiresAt,
            authNetSubscriptionId: subscriptionId,
        },
    });

    return successResponse({ memberProduct, transactionId, subscriptionId }, 201);
}
