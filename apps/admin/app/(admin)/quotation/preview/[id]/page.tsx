import { getQuotationAction } from "@repo/actions/quotation";
import QuotationPreview from "./quotation-preview";


export type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuotationPage(props: Props) {
  const { id } = await props.params; 
  const quotationId = parseInt(id);
  const quotation = await getQuotationAction(quotationId);

  if (!quotation) {
    return <div>Devis introuvable.</div>;
  }

  return <QuotationPreview quotation={quotation} />;
}

