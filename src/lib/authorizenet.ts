import ApiContracts from "authorizenet/lib/apicontracts";
import ApiControllers from "authorizenet/lib/apicontrollers";
import Constants from "authorizenet/lib/constants";

function getMerchantAuth() {
    const auth = new ApiContracts.MerchantAuthenticationType();
    auth.setName(process.env.AUTHORIZENET_API_LOGIN_ID!);
    auth.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY!);
    return auth;
}

function getEnvironment() {
    return process.env.AUTHORIZENET_ENVIRONMENT === "production"
        ? Constants.endpoint.production
        : Constants.endpoint.sandbox;
}

// ─── One-time charge ──────────────────────────────────────────────────────────

export interface ChargeCardParams {
    cardNumber: string;
    expirationDate: string; // YYYY-MM
    cvv: string;
    amount: number;
    description: string;
    firstName: string;
    lastName: string;
    email: string;
}

export async function chargeCard(params: ChargeCardParams): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
}> {
    return new Promise((resolve) => {
        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(params.cardNumber);
        creditCard.setExpirationDate(params.expirationDate);
        creditCard.setCardCode(params.cvv);

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        const billTo = new ApiContracts.CustomerAddressType();
        billTo.setFirstName(params.firstName);
        billTo.setLastName(params.lastName);
        billTo.setEmail(params.email);

        const transactionRequest = new ApiContracts.TransactionRequestType();
        transactionRequest.setTransactionType(
            ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
        );
        transactionRequest.setAmount(params.amount.toFixed(2));
        transactionRequest.setPayment(paymentType);
        transactionRequest.setBillTo(billTo);

        const request = new ApiContracts.CreateTransactionRequest();
        request.setMerchantAuthentication(getMerchantAuth());
        request.setTransactionRequest(transactionRequest);

        const ctrl = new ApiControllers.CreateTransactionController(request.getJSON());
        ctrl.setEnvironment(getEnvironment());

        ctrl.execute(() => {
            const response = ctrl.getResponse();
            if (
                response?.messages?.resultCode === "Ok" &&
                response?.transactionResponse?.responseCode === "1"
            ) {
                resolve({ success: true, transactionId: response.transactionResponse.transId });
            } else {
                const msg =
                    response?.transactionResponse?.errors?.error?.[0]?.errorText ??
                    response?.messages?.message?.[0]?.text ??
                    "Payment failed.";
                resolve({ success: false, error: msg });
            }
        });
    });
}

// ─── Create customer profile ──────────────────────────────────────────────────

export async function createCustomerProfile(params: {
    email: string;
    firstName: string;
    lastName: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
}): Promise<{ success: boolean; customerProfileId?: string; paymentProfileId?: string; error?: string }> {
    return new Promise((resolve) => {
        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(params.cardNumber);
        creditCard.setExpirationDate(params.expirationDate);
        creditCard.setCardCode(params.cvv);

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        const billTo = new ApiContracts.CustomerAddressType();
        billTo.setFirstName(params.firstName);
        billTo.setLastName(params.lastName);
        billTo.setEmail(params.email);

        const paymentProfile = new ApiContracts.CustomerPaymentProfileType();
        paymentProfile.setPayment(paymentType);
        paymentProfile.setBillTo(billTo);

        const customerProfile = new ApiContracts.CustomerProfileType();
        customerProfile.setEmail(params.email);
        customerProfile.setPaymentProfiles([paymentProfile]);

        const request = new ApiContracts.CreateCustomerProfileRequest();
        request.setMerchantAuthentication(getMerchantAuth());
        request.setProfile(customerProfile);

        const ctrl = new ApiControllers.CreateCustomerProfileController(request.getJSON());
        ctrl.setEnvironment(getEnvironment());

        ctrl.execute(() => {
            const response = ctrl.getResponse();
            if (response?.messages?.resultCode === "Ok") {
                resolve({
                    success: true,
                    customerProfileId: response.customerProfileId,
                    paymentProfileId: response.customerPaymentProfileIdList?.numericString?.[0],
                });
            } else {
                resolve({
                    success: false,
                    error: response?.messages?.message?.[0]?.text ?? "Failed to create customer profile.",
                });
            }
        });
    });
}

// ─── Create recurring subscription ───────────────────────────────────────────

export async function createSubscription(params: {
    firstName: string;
    lastName: string;
    email: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
    amount: number;
    intervalUnit: "months" | "days";
    intervalLength: number;
    totalOccurrences: number; // 9999 = ongoing
    startDate: string; // YYYY-MM-DD
    name: string;
}): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    return new Promise((resolve) => {
        const interval = new ApiContracts.PaymentScheduleType.Interval();
        interval.setLength(params.intervalLength);
        interval.setUnit(
            params.intervalUnit === "months"
                ? ApiContracts.ARBSubscriptionUnitEnum.MONTHS
                : ApiContracts.ARBSubscriptionUnitEnum.DAYS
        );

        const paymentSchedule = new ApiContracts.PaymentScheduleType();
        paymentSchedule.setInterval(interval);
        paymentSchedule.setStartDate(params.startDate);
        paymentSchedule.setTotalOccurrences(params.totalOccurrences);

        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(params.cardNumber);
        creditCard.setExpirationDate(params.expirationDate);
        creditCard.setCardCode(params.cvv);

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        const billTo = new ApiContracts.NameAndAddressType();
        billTo.setFirstName(params.firstName);
        billTo.setLastName(params.lastName);

        const subscription = new ApiContracts.ARBSubscriptionType();
        subscription.setName(params.name);
        subscription.setPaymentSchedule(paymentSchedule);
        subscription.setAmount(params.amount.toFixed(2));
        subscription.setPayment(paymentType);
        subscription.setBillTo(billTo);

        const request = new ApiContracts.ARBCreateSubscriptionRequest();
        request.setMerchantAuthentication(getMerchantAuth());
        request.setSubscription(subscription);

        const ctrl = new ApiControllers.ARBCreateSubscriptionController(request.getJSON());
        ctrl.setEnvironment(getEnvironment());

        ctrl.execute(() => {
            const response = ctrl.getResponse();
            if (response?.messages?.resultCode === "Ok") {
                resolve({ success: true, subscriptionId: response.subscriptionId });
            } else {
                resolve({
                    success: false,
                    error: response?.messages?.message?.[0]?.text ?? "Failed to create subscription.",
                });
            }
        });
    });
}

// ─── Cancel subscription ──────────────────────────────────────────────────────

export async function cancelSubscription(
    subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
        const request = new ApiContracts.ARBCancelSubscriptionRequest();
        request.setMerchantAuthentication(getMerchantAuth());
        request.setSubscriptionId(subscriptionId);

        const ctrl = new ApiControllers.ARBCancelSubscriptionController(request.getJSON());
        ctrl.setEnvironment(getEnvironment());

        ctrl.execute(() => {
            const response = ctrl.getResponse();
            if (response?.messages?.resultCode === "Ok") {
                resolve({ success: true });
            } else {
                resolve({
                    success: false,
                    error: response?.messages?.message?.[0]?.text ?? "Failed to cancel subscription.",
                });
            }
        });
    });
}

// ─── Refund transaction ───────────────────────────────────────────────────────

export async function refundTransaction(
    transactionId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
        const creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber("XXXX");
        creditCard.setExpirationDate("XXXX");

        const paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);

        const transactionRequest = new ApiContracts.TransactionRequestType();
        transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.REFUNDTRANSACTION);
        transactionRequest.setAmount(amount.toFixed(2));
        transactionRequest.setPayment(paymentType);
        transactionRequest.setRefTransId(transactionId);

        const request = new ApiContracts.CreateTransactionRequest();
        request.setMerchantAuthentication(getMerchantAuth());
        request.setTransactionRequest(transactionRequest);

        const ctrl = new ApiControllers.CreateTransactionController(request.getJSON());
        ctrl.setEnvironment(getEnvironment());

        ctrl.execute(() => {
            const response = ctrl.getResponse();
            if (
                response?.messages?.resultCode === "Ok" &&
                response?.transactionResponse?.responseCode === "1"
            ) {
                resolve({ success: true });
            } else {
                resolve({
                    success: false,
                    error:
                        response?.transactionResponse?.errors?.error?.[0]?.errorText ??
                        response?.messages?.message?.[0]?.text ??
                        "Refund failed.",
                });
            }
        });
    });
}
