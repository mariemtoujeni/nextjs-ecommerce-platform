import { Link, Star } from "lucide-react";

import {
  Button,
  Heading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";
import OrderBack from "./OrderBack";
import { LangParams } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";
import { getInformationClientAction , getTitleProductByOrderAction} from "@repo/actions/account-client";

import AddOpinion from "./AddOpinion";

type OrderParams = LangParams & { orderId: string };
export type Props = {
   params: Promise<OrderParams>;
};


export default async function ReviewsPage(props: Props) {

  const { lang, orderId } = await props.params;
  const translations = await getDictionary(lang);
  const idNum = parseInt(orderId, 10);   

  return (
    <>
      <OrderBack translations={translations}/>
      <Heading heading="5">{translations.costumerAccount.review.title}</Heading>
      <p className="mt-5 text-black text-sm sm:text-base">
        {translations.costumerAccount.review.content}
      </p>
     <AddOpinion translations={translations} idNum={idNum} lang={lang} />
    </>
  );
}
