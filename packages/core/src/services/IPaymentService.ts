import { BodyResponse } from "../types";
import { PaymentPayload } from "./PaymentService";

export interface IPaymentService {
  generateToken(payload: PaymentPayload): Promise<BodyResponse>;
}
