import { BodyResponse } from "../types/utils";
import { IPaymentService } from "./IPaymentService";
import { ErrorCodes } from "../types/error";

export interface PaymentPayload {
  amount: number;
  currency: string;
  customer: {
    reference: string; 
  };
}

export class PaymentService implements IPaymentService {
  private readonly systemPayUrl = 'https://api.systempay.fr/api-payment/V4/Charge/CreatePayment'
  private readonly isDebug = process.env.DEBUG_PAYMENT === "test";

  private readonly apiKey = this.isDebug
    ? process.env.SYSTEMPAY_TEST_API_KEY!
    : process.env.SYSTEMPAY_PROD_API_KEY!;

  private readonly apiSecret = this.isDebug
    ? process.env.SYSTEMPAY_TEST_API_SECRET!
    : process.env.SYSTEMPAY_PROD_API_SECRET!;

  async generateToken(payload: PaymentPayload): Promise<BodyResponse> {

    const credentials = Buffer.from(`${this.apiSecret}`).toString("base64");

    try {
      const res = await fetch(this.systemPayUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const formToken = data?.answer?.formToken;

      if (!res.ok || !formToken) {
        return {
          success: false,
          code: data?.status || "FORM_TOKEN_ERROR",
          message: data?.message || "Erreur lors de la création du formToken.",
          data,
          error: ErrorCodes.PAIEMENT_IMPOSSIBLE,
          pubKey: `${this.apiKey}`
        };
      }

      return {
        success: true,
        message: "Form token généré avec succès.",
        data: { formToken },
        pubKey: `${this.apiKey}`
      };

    } catch (err) {
      return {
        success: false,
        message: `Erreur technique : ${(err as Error).message}`,
        error: ErrorCodes.PAIEMENT_IMPOSSIBLE,
        code: "SYSTEMPAY_EXCEPTION",
        pubKey: `${this.apiKey}`
      };
    }
  }


}
