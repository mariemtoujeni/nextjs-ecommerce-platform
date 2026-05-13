import { getGiftVoucherClientAction } from "@repo/actions/account-client";
import { GiftCard } from "@repo/core/models";
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

export default async function GiftVouchersPage(props: Props) {
  const { lang } = await props.params;
  const translations = await getDictionary(lang);
  let giftVouchers :GiftCard [] = []
  try{
     const giftVouchersResult = await getGiftVoucherClientAction();
     giftVouchers = giftVouchersResult.items;
  } catch (error) {
    return redirect(`/${lang}/`);
  }
  

  return (
   <div className="flex flex-col gap-4">
  <Heading heading="5">
    {translations.costumerAccount.giftVoucher.title}
  </Heading>

  <Table className="overflow-hidden shadow-sm">
    <TableHeader className="hidden md:table-header-group">
      <TableRow>
        <TableHead>{translations.costumerAccount.giftVoucher.order}</TableHead>
        <TableHead>{translations.costumerAccount.giftVoucher.usedDate}</TableHead>
        <TableHead>{translations.costumerAccount.giftVoucher.endDate}</TableHead>
        <TableHead>{translations.costumerAccount.giftVoucher.amount}</TableHead>
        <TableHead>{translations.costumerAccount.giftVoucher.remainingAmount}</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {giftVouchers.map((gifts, index) => (
        <TableRow
          key={index}
          className="block md:table-row border-b md:border-0"
        >
          <TableCell
            data-label={translations.costumerAccount.giftVoucher.order}
            className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
          >
            {gifts.commandId}
          </TableCell>

          <TableCell
            data-label={translations.costumerAccount.giftVoucher.usedDate}
            className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
          >
            {gifts.usedAt &&
              new Date(gifts.usedAt).toLocaleDateString("fr-FR")}
          </TableCell>

          <TableCell
            data-label={translations.costumerAccount.giftVoucher.endDate}
            className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
          >
            {gifts.expirationDate &&
              new Date(gifts.expirationDate).toLocaleDateString("fr-FR")}
          </TableCell>

          <TableCell
            data-label={translations.costumerAccount.giftVoucher.amount}
            className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
          >
            {gifts.value}
          </TableCell>

          <TableCell
            data-label={translations.costumerAccount.giftVoucher.remainingAmount}
            className="block md:table-cell px-4 py-3 before:block before:font-semibold before:text-gray-500 before:content-[attr(data-label)] md:before:content-none"
          >
            {gifts.remainingValue}
          </TableCell>
        </TableRow>
      ))}
       {giftVouchers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                     {translations.costumerAccount.giftVoucher.message}
                    </TableCell>
                  </TableRow>
                )}
    </TableBody>
  </Table>
</div>

  );
}
