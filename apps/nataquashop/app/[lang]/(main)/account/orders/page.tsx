import { Heading } from "~/components/ui";

import { getInformationClientAction } from "@repo/actions/account-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import RedirectPage from "./Redirect";
import { LangParams } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";
import { Client } from "@repo/core/models";
import { redirect } from "next/navigation";

export type Props = { params: Promise<LangParams> };

export default async function OrdersPage(props: Props) {
  const { lang } = await props.params;
  const translations = await getDictionary(lang);
  let orders: Client["order"] = [];
  try {
    const clientReturned = await getInformationClientAction();
    const client = clientReturned.item;
    orders = (client.order || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    return redirect(`/${lang}/`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading heading="5">{translations.costumerAccount.orders.title}</Heading>
      <Table className="overflow-hidden shadow-sm">
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead>{translations.costumerAccount.orders.date}</TableHead>
            <TableHead>
              {translations.costumerAccount.orders.reference}
            </TableHead>
            <TableHead>{translations.costumerAccount.orders.status}</TableHead>
            <TableHead>{translations.costumerAccount.orders.price}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="flex flex-col md:table-row-group ">
          {orders.map((order, index) => (
            <TableRow
              key={index}
              className="block md:table-row border-b md:border-0"
            >
              <TableCell
                data-label={translations.costumerAccount.orders.date}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.orders.reference}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {order.id}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.orders.status}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {order.status}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.orders.price}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {order.amount.toFixed(2)} €
              </TableCell>
              <TableCell className="flex justify-end py-3 px-4">
                <RedirectPage translations={translations} orderId={order.id} />
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                {translations.costumerAccount.orders.message}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
