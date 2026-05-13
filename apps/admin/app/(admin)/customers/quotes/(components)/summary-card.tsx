'use client';

import { DiscountType, Quotation, QuotationDiscount, QuotationLine } from "@repo/core/models";
import { Card, CardHeader, CardContent, CardTitle, Heading, Separator, Button } from "~/components/ui";
import { Table, TableBody, TableRow, TableCell } from "~/components/ui/table";

interface SummaryCardProps {
  quotation: Quotation;
  quotationLines: QuotationLine[];
  quotationDiscounts: QuotationDiscount[];
  onValidateQuotation: () => void;
  onDownloadQuotation: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  quotation, 
  quotationLines, 
  quotationDiscounts, 
  onValidateQuotation,
  onDownloadQuotation
}: SummaryCardProps) => {

  const calculateLineTotal = (line: QuotationLine) => {
    const basePrice = line.unitPriceExcludingTax * line.quantity;
    const discount = line.discountValueType === DiscountType.PERCENTAGE 
      ? basePrice * (line.discountValue / 100)
      : line.discountValue * line.quantity;
    return basePrice - discount;
  };

  const totalArticles = quotationLines.reduce((acc, line) => acc + line.quantity, 0);
  const subTotal = quotationLines.reduce((acc, line) => acc + calculateLineTotal(line), 0);
  const totalDiscount = quotationDiscounts.reduce((acc, discount) => acc + (discount.value || 0), 0); 
  const totalVat = quotationLines.reduce((acc, line) => {
    const lineTotal = line.unitPriceExcludingTax * line.quantity;
    return acc + (lineTotal * (line.tva || 0) / 100);
  }, 0);
  const total = subTotal - totalDiscount + (quotation.shippingFees || 0) + totalVat;

  const formatCurrency = (value: number) => {
    return value.toFixed(2) + ' €';
  };

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>
          <Heading heading="3" className="text-gray-700 font-bold">Synthèse</Heading>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-2 w-full">
          <Table className="w-full">
            <TableBody>
              {quotationLines.map((line) => (
                <TableRow className="border-none" key={line.id}>
                  <TableCell className="w-1/4 border-none">{line.modelProduct?.name}</TableCell>
                  <TableCell className="w-1/4 border-none">{formatCurrency(line.unitPriceExcludingTax)}</TableCell>
                  <TableCell className="w-1/4 border-none">
                    {line.quantity} article{line.quantity > 1 ? 's' : ''}
                  </TableCell>                                        
                  <TableCell className="w-1/4 border-none text-right">
                    {formatCurrency(calculateLineTotal(line))}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Sous-total */}
              <TableRow className="border-none">
                <TableCell className="w-1/4 border-none">Sous-total</TableCell>
                <TableCell className="w-1/4 border-none"></TableCell>
                <TableCell className="w-1/4 border-none">{totalArticles} articles</TableCell>
                <TableCell className="w-1/4 border-none text-right">
                  {formatCurrency(subTotal)}
                </TableCell>
              </TableRow>
              
              {/* Réduction */}
              <TableRow className="border-none">
                <TableCell className="w-1/4 border-none">Réduction</TableCell>
                <TableCell className="w-1/4 border-none"></TableCell>
                <TableCell className="w-1/4 border-none"></TableCell>
                <TableCell className="w-1/4 border-none text-right">
                  {formatCurrency(totalDiscount)}
                </TableCell>
              </TableRow>
              
              {/* TVA */}
              <TableRow className="border-none">
                <TableCell className="w-1/4 border-none">TVA</TableCell>
                <TableCell className="w-1/4 border-none"></TableCell>
                <TableCell className="w-1/4 border-none"></TableCell>
                <TableCell className="w-1/4 border-none text-right">
                  {formatCurrency(totalVat)}
                </TableCell>
              </TableRow>
              
              {/* Frais de port */}
              {quotation.shippingFees ? (
                <>
                  <TableRow className="border-none">
                    <TableCell className="w-1/4 border-none">Frais de port</TableCell>
                    <TableCell className="w-1/4 border-none"></TableCell>
                    <TableCell className="w-1/4 border-none"></TableCell>
                    <TableCell className="w-1/4 border-none text-right">
                      {formatCurrency(quotation.shippingFees)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <Separator />
                    </TableCell>
                  </TableRow>
                </>
              ) : null}
              {/* Total */}
              <TableRow>
                <TableCell className="w-1/4 font-bold">Total</TableCell>
                <TableCell className="w-1/4"></TableCell>
                <TableCell className="w-1/4"></TableCell>
                <TableCell className="w-1/4 text-right font-bold">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline"
            onClick={onValidateQuotation}
          >
            Valider
          </Button>
          <Button 
            variant="default" 
            onClick={onDownloadQuotation}
          >
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};