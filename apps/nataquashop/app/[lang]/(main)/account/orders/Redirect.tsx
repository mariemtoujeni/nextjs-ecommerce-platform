"use client";
import { useRouter } from "next/navigation";
import { dictionary } from "~/app/dictionaries";
import { TableActionsMenu } from "~/components/ui/table-actions-menu";
interface Props {
  translations: dictionary;
  orderId: number;
}

export default function RedirectPage({translations,orderId}:Props) {
  const router = useRouter();

  return (
    <TableActionsMenu
      options={[
       /* {label:translations.costumerAccount.actionMenu.returnItems},*/
        { label: translations.costumerAccount.actionMenu.review,
          onClick: () => router.push(`orders/${orderId}/reviews`),
        },
       /* { label: translations.costumerAccount.actionMenu.trackPackage },*/
      ]}
    />
  );
}
