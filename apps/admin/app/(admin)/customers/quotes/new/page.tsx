export const dynamic = 'force-dynamic';

import { addQuotationAction, addQuotationDiscountAction } from "@repo/actions/quotation";
import { DiscountType, QuotationDiscountType, QuotationStatus } from "@repo/core/models";
import { CardWrapper } from "../(components)/card-wrapper";

export default async function CreateQuotePage() {
  const quotation = await addQuotationAction({
    title: 'Brouillon devis',
    status: QuotationStatus.EN_ATTENTE,
    totalAmount: 0,
    shippingFees: 0,
    withoutTVA: false,
    totalDiscount: 0,
    clientComment: '',
    usedCredit: 0,
    version: 0,
  });

  const quotationDiscount = await addQuotationDiscountAction({
    quotationId: quotation.id,
    valueType: DiscountType.PERCENTAGE,
    discountId: 0,
    value: 0,
    info: "",
    type: QuotationDiscountType.CLUB
  });

  return (
    <div className="w-full">
      <CardWrapper
        quotation={quotation}
        quotationDiscountsProp={{ items: [quotationDiscount], total: 1, count: 1 }}
      />
    </div>
  );
}
