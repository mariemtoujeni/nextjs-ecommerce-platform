"use client";
import { anonymizeClientAction } from "@repo/actions/account-client";
import { redirect } from "next/navigation";
import { dictionary } from "~/app/dictionaries";
import { Button } from "~/components/ui";

interface Props {
  translations: dictionary;
}

export default function ConfirmPage({ translations }: Props) {
  const handleChange = async () => {
    try {
      await anonymizeClientAction();
    redirect(`/dashbord`);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button variant="outline" onClick={handleChange}>
      {translations.costumerAccount.deleteAccount.confirm}
    </Button>
  );
}
