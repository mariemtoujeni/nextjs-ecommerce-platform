import { Heading } from "~/components/ui/heading";
import Link from "next/link";
import { getDictionary } from "../../../dictionaries";
import { LangParams } from "~/app/utils";
import ForgotPassword from "./ForgotPassword";
import CancelPage from "./Cancel";


export type Props = { params: Promise<LangParams> };

export default async function ForgotPasswordPage(props: Props) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col gap-4">      
      <div className="flex flex-col justify-between gap-2">
        <Heading heading="4" className="font-extrabold">
          {dict.forgotPassword.title}
        </Heading>
      </div>
       
      <ForgotPassword dict={dict} />

      <div className="mt-8 flex justify-between text-sm">
        <Link href={`/${lang}`} className="text-neutral-500 hover:underline">
          &larr; {dict.login.backToShop}
        </Link>
        <CancelPage dict={dict} />
      </div>
    </div>
  );
}
