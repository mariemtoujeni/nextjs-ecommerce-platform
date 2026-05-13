import { getDictionary } from "~/app/dictionaries";
import { LangParams } from "~/app/utils";
import { Heading } from "~/components/ui";
import ResetPassword from "./ResetPassword";


export type Props = { params: Promise<LangParams> };

export default async function ResetPasswordPage(props: Props) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-2">
        <Heading heading="4" className="font-extrabold">
          {dict.forgotPassword.submit}
        </Heading>
      </div>
      <ResetPassword dict={dict} />
    </div>
  );
}
