import { Heading } from "~/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getReturnClientAction } from "@repo/actions/account-client";
import { LangParams } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";
import { Return } from "@repo/core/models";
import { redirect } from "next/navigation";

export type Props = { params: Promise<LangParams> };
export default async function ReturnsPage(props: Props) {
  const { lang } = await props.params;
  const translations = await getDictionary(lang);
  let returns: Return[] = [];
  try {
    const returnsList = await getReturnClientAction();
    returns = returnsList.items;
  } catch (error) {
    return redirect(`/${lang}/`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading heading="5">{translations.costumerAccount.return.title}</Heading>
      <Table className="overflow-hidden shadow-sm">
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead>{translations.costumerAccount.return.order}</TableHead>
            <TableHead>{translations.costumerAccount.return.date}</TableHead>
            <TableHead>{translations.costumerAccount.return.type}</TableHead>
            <TableHead>
              {translations.costumerAccount.return.shipping}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((retour) => (
            <TableRow
              key={retour.id}
              className="block md:table-row border-b md:border-0"
            >
              <TableCell
                data-label={translations.costumerAccount.return.order}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {retour.id_commande}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.return.date}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {new Date(retour.date_demande).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.return.type}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {retour.type_retour}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.return.shipping}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {new Date(retour.date_reexpedition).toLocaleDateString("fr-FR")}
              </TableCell>
            </TableRow>
          ))}
          {returns.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                {translations.costumerAccount.return.message}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
