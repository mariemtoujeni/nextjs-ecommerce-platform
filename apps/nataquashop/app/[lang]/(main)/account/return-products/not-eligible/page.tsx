import { Heading } from "~/components/ui";
import OrderBack from "../../orders/[orderId]/reviews/OrderBack";
import { getDictionary } from "~/app/dictionaries";
import { LangParams } from "~/app/utils";

export type Props = { params: Promise<LangParams> };

export default async function ReturnProductsPage(props:Props) {
  const { lang } = await props.params;
  const translations = await getDictionary(lang);
  return (
    <div className="flex flex-col gap-4 ">
      <OrderBack translations={translations}/>
      <div className="ml-2">
        <Heading heading="5">IMPOSSIBLE D'EFFECTUER UN RETOUR</Heading>
      <p>Cette commande n'est plus éligible à un retour, vous avez dépassé le délai.</p>
      </div>
    </div>
  );
}