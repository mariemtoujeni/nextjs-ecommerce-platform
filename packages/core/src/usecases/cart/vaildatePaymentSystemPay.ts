import crypto from "crypto";
import { PaymentPayload } from "../../services";

const SystemPayPassword = {
  TEST: process.env.SYSTEMPAY_TEST_API_SECRET!,
  PROD: process.env.SYSTEMPAY_PROD_API_SECRET!,
};

export const validateSystemPayCallbackUseCase = async (
  body?: any
): Promise<PaymentPayload> => {

  const algo = body.hashAlgorithm as string;
  if ("sha256_hmac" !== algo) {
    throw new Error('Invalid hash algorithm');
  }

  const krAnswer = body.clientAnswer;
  const answer = JSON.parse(JSON.stringify(krAnswer));

  if ("PAID" !== answer.orderStatus) {
    throw new Error('Order not paid');
  }
  // const hashPassword = SystemPayPassword[answer.orderDetails.mode as keyof typeof SystemPayPassword].split(':')[1];
  // if (!hashPassword) {
  //   throw new Error('Invalid hashPassword credentials');
  // }

  // const expectedHash = body.hash as string;
  // const computedHmac = crypto
  //   .createHmac('sha256', hashPassword)
  //   .update(body.rawClientAnswer, 'utf8')
  //   .digest('hex');

  // // if (expectedHash !== computedHmac) {
  // //   throw new Error('Invalid hash');
  // // }

  return {
    amount: answer.orderDetails.orderTotalAmount,
    currency: answer.orderDetails.orderCurrency,
    customer: {
      reference: answer.customer.reference,
    },
  };
};
