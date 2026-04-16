import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/routeGuard";
import { errorResponse, successResponse } from "@/lib/api";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/members/:id/refund  body: { memberProductId, transactionId, amount }
export async function POST(req: NextRequest, { params }: Params) {
    const { error, payload } = requireRole(req, Role.MANAGER);
    if (error) return error;
    const { id } = await params;

    const member = await prisma.user.findFirst({ where: { id, tenantId: payload!.tenantId } });
    if (!member) return errorResponse("Member not found.", 404);

    const { memberProductId, transactionId, amount } = await req.json();
    if (!memberProductId) return errorResponse("memberProductId is required.");

    const mp = await prisma.memberProduct.findUnique({ where: { id: memberProductId } });
    if (!mp || mp.userId !== id) return errorResponse("Membership not found.", 404);

    // If transactionId provided, process refund via Authorize.net
    if (transactionId && amount) {
        const ApiContracts = (await import("authorizenet/lib/apicontracts")).default;
        const ApiControllers = (await import("authorizenet/lib/apicontrollers")).default;
        const Constants = (await import("authorizenet/lib/constants")).default;

        const refundResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
            const creditCard = new ApiContracts.CreditCardType();
            creditCard.setCardNumber("XXXX");
            creditCard.setExpirationDate("XXXX");

            const paymentType = new ApiContracts.PaymentType();
            paymentType.setCreditCard(creditCard);

            const transactionRequest = new ApiContracts.TransactionRequestType();
            transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.REFUNDTRANSACTION);
            transactionRequest.setAmount(Number(amount).toFixed(2));
            transactionRequest.setPayment(paymentType);
            transactionRequest.setRefTransId(transactionId);

            const request = new ApiContracts.CreateTransactionRequest();
            request.setMerchantAuthentication((() => {
                const auth = new ApiContracts.MerchantAuthenticationType();
                auth.setName(process.env.AUTHORIZENET_API_LOGIN_ID!);
                auth.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY!);
                return auth;
            })());
            request.setTransactionRequest(transactionRequest);

            const ctrl = new ApiControllers.CreateTransactionController(request.getJSON());
            ctrl.setEnvironment(
                process.env.AUTHORIZENET_ENVIRONMENT === "production"
                    ? Constants.endpoint.production
                    : Constants.endpoint.sandbox
            );
            ctrl.execute(() => {
                const response = ctrl.getResponse();
                if (response?.messages?.resultCode === "Ok" && response?.transactionResponse?.responseCode === "1") {
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: response?.transactionResponse?.errors?.error?.[0]?.errorText ?? "Refund failed." });
                }
            });
        });

        if (!refundResult.success) return errorResponse(refundResult.error ?? "Refund failed.", 502);
    }

    // Cancel the membership
    await prisma.memberProduct.update({
        where: { id: memberProductId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return successResponse({ message: "Refund processed and membership cancelled." });
}
