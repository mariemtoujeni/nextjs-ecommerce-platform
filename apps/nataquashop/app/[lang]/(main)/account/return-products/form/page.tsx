import {
    Button,
  Checkbox,
  Heading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";
import OrderBack from "../../orders/[orderId]/reviews/OrderBack";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import SelectProduct from "./SelectProduct";
import { LangParams } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";

export type Props = { params: Promise<LangParams> };
export default async function FormPage(props: Props) {
   const { lang } = await props.params;
      const translations = await getDictionary(lang);
  return (
    <div className="flex flex-col gap-4 ">
      <OrderBack translations={translations} />
      <div className="ml-2">
        <Heading heading="5">EFFECTUER UN RETOUR</Heading>
        <p>Sélectionnez le/les produits concernés par la demande de retour.</p>
        <SelectProduct />
        
      </div>
    </div>
  );
}
