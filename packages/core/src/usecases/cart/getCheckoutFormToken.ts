import { getInjection } from "../../types/di";
import { PaymentPayload } from "../../services";
import { FormCheckout } from "../../models/Cart";
import { UnauthorizedError } from "../../types/error";
import { getCartSummaryUseCase } from "./getCartSummary";

export const getCheckoutFormTokenUseCase = async (): Promise<FormCheckout> => {
    const paymentService = await getInjection("IPaymentService");
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found"); 
    }

    const cartSummary = await getCartSummaryUseCase()

    const montant = Math.round(Number(cartSummary.total.toFixed(2)) * 100);
    const payload: PaymentPayload = {
        amount: montant,
        currency: "EUR",
        customer: {
            reference: user.id
        }
    };

    const paymentResponse = await paymentService.generateToken(payload);

    return {
        token: paymentResponse.data.formToken,
        pubKey: paymentResponse.pubKey,
    }
   
};
