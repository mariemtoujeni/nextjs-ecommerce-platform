"use client";

import { useRouter } from "next/navigation";
import { dictionary } from "~/app/dictionaries";

import { Button } from "~/components/ui";

interface Props {
  translations: dictionary;
}


export default function AnonymizeClient({ translations }: Props) {
    const router = useRouter();
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
      <Button variant="outline" size="default" onClick={() => router.push("/account/informations/delete-account")}>
        {translations.costumerAccount.deleteAccount.delete}
      </Button>
    </div>
  );
}
