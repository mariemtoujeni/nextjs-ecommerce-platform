import { getCreditNoteAction } from "@repo/actions/account-client";
import { CreditNote } from "@repo/core/models";
import { redirect } from "next/navigation";
import { getDictionary } from "~/app/dictionaries";
import { LangParams } from "~/app/utils";
import { Heading } from "~/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export type Props = { params: Promise<LangParams> };

export default async function DiscountsPage(props: Props) {
  const { lang } = await props.params;
  const translations = await getDictionary(lang);
  let creditNotes: CreditNote[] = [];
  try {
    const creditNotesResult = await getCreditNoteAction();
    creditNotes = creditNotesResult.items;
  } catch (error) {
    return redirect(`/${lang}/`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading heading="5">
        {translations.costumerAccount.creditNote.title}
      </Heading>
      <Table className="overflow-hidden shadow-sm">
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead>
              {translations.costumerAccount.creditNote.order}
            </TableHead>
            <TableHead>
              {translations.costumerAccount.creditNote.date}
            </TableHead>
            <TableHead>
              {translations.costumerAccount.creditNote.type}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditNotes.map((credit, index) => (
            <TableRow
              key={index}
              className="block md:table-row border-b md:border-0"
            >
              <TableCell
                data-label={translations.costumerAccount.creditNote.order}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {credit.orderId}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.creditNote.date}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {new Date(credit.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell
                data-label={translations.costumerAccount.creditNote.type}
                className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
              >
                {credit.type}
              </TableCell>
            </TableRow>
          ))}
          {creditNotes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                {translations.costumerAccount.creditNote.message}
              </TableCell>
            </TableRow>
                )}
        </TableBody>
      </Table>
    </div>
  );
}
