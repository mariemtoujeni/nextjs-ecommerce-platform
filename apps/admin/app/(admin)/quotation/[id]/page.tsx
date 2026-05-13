import { getQuotationAction, getQuotationLinesAction, getQuotationDiscountsAction } from "@repo/actions/quotation";
import { CardWrapper } from "../../customers/quotes/(components)/card-wrapper";
import { getClientAction } from "@repo/actions/clients";
import { Quotation } from "@repo/core/models";
import { getAllProductModelsAction } from "@repo/actions/product-models";


export type Props = {
  params: Promise<{ id: string }>;
};

export default async function DetailQuotationPage(props: Props) {
  const { id } = await props.params; 
  const quotationId = parseInt(id);
  const quotation = await getQuotationAction(quotationId);
  const quotationLines = await getQuotationLinesAction(quotationId);
  const quotationDiscounts = await getQuotationDiscountsAction(quotationId);
  const clientData = await getClientAction(quotation.clientNumber);
  const products = await getAllProductModelsAction({sort: 'asc'});  

  const quotationPresenter: Quotation = {
      ...quotation,
      client: clientData,
  };

  return (
    <CardWrapper quotation={quotationPresenter} quotationLinesProp={quotationLines} quotationDiscountsProp={quotationDiscounts} 
                 productsProp={products}/>
  );
}
