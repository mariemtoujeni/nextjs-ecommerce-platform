
import { getDictionary } from "~/app/dictionaries";
import { LangParams } from "~/app/utils";

import { Button, Heading } from "~/components/ui";
import CancelPage from "./Cancel";
import ConfirmPage from "./Confirm";




export default async function DeleteAccount(props: { params: Promise<LangParams> }) {
    const params = await props.params;
    const dict = await getDictionary(params.lang);
  return (
    <>
      <Heading heading="5" className="mt-5"> {dict.costumerAccount.deleteAccount.title}</Heading>
      <div className="flex ">
        <p className="mt-5 text-black text-sm sm:text-base">{dict.costumerAccount.deleteAccount.text}</p>
      </div>
      <div className="flex-1 flex items-end justify-end gap-2 mt-5">  
     <CancelPage translations={dict} />
      <ConfirmPage translations={dict}/>
      </div>

    </>
  );
}
