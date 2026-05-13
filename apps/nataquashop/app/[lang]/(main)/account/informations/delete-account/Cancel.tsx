"use client"

import { useRouter } from "next/navigation";
import { dictionary } from "~/app/dictionaries";
import { Button } from "~/components/ui";
interface Props {
  translations: dictionary;
}

export default function CancelPage({ translations }: Props){
    const router = useRouter();
    return(
         <Button variant="outline" onClick={() => router.push("/account/informations")}>{translations.costumerAccount.deleteAccount.cancel}</Button>
    )
}