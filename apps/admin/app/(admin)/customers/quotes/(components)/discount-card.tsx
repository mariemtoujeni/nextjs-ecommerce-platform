'use client';

import { Card, CardHeader, CardContent, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Button } from "~/components/ui/button"; 
import { Plus, X } from "lucide-react";
import { DiscountType, QuotationDiscount } from "@repo/core/models";

interface DiscountCardProps {
  discounts: QuotationDiscount[];
  isEditable: boolean;
  onAddDiscount: () => void;
  onRemoveDiscount: (id: number) => void;
  onUpdateDiscount: (id: number, field: keyof QuotationDiscount, value: any) => void;
  subTotal: number,
}



export const DiscountCard: React.FC<DiscountCardProps> = ({ discounts, isEditable, onAddDiscount, onRemoveDiscount, onUpdateDiscount, subTotal }: DiscountCardProps) => {
  const calculateDiscountTotal = (discount: QuotationDiscount) => {
    if (!discount.value) return subTotal;
    
    return discount.valueType === DiscountType.PERCENTAGE
      ? (subTotal * discount.value) / 100
      : subTotal - discount.value;
  };

  return (
    <Card>
      <CardHeader className="text-gray-700 font-bold">Réductions globales</CardHeader>
      <CardContent className="space-y-4">
        <div className="border overflow-x-auto rounded-lg">
          <Table className="min-w-full table-fixed">
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead className="w-[36%]">Information</TableHead>
                <TableHead className="w-[30%]">Réduction</TableHead>
                <TableHead className="w-[26%] text-right">Total</TableHead>
                <TableHead className=""></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => {
                const discountTotal = calculateDiscountTotal(discount);
                return (
                <TableRow key={discount.id}>
                  <TableCell>
                    <Input
                      value={discount.info || ""}
                      onChange={e => onUpdateDiscount(discount.id, "info", e.target.value)}
                      placeholder="Libellé"
                      disabled={!isEditable}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row gap-1">
                      <Input
                        value={discount.value?.toString() || ""}
                        onChange={e => onUpdateDiscount(discount.id, "value", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        type="number" min={0}
                        disabled={!isEditable}
                      />
                      <Select 
                        value={discount.valueType || DiscountType.FIXED}
                        onValueChange={(val) => onUpdateDiscount(discount.id, "valueType", val)}
                        disabled={!isEditable}
                      >
                        <SelectTrigger className="bg-muted focus:bg-white">
                          <SelectValue placeholder="Sélectionner une devise" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DiscountType.PERCENTAGE}>%</SelectItem>
                          <SelectItem value={DiscountType.FIXED}>€</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{discountTotal} €</TableCell>
                  <TableCell className="">
                    <Button
                      onClick={() => onRemoveDiscount(discount.id)}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 p-0"
                      disabled={!isEditable}
                    >
                      <X />
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {isEditable && (
          <div className="flex justify-start">
            <Button
              className="flex flex-row gap-1 cursor-pointer"
              onClick={onAddDiscount}
              variant="ghost"
            >
              <Plus className="text-blue-500" />
              <span className="text-blue-500 underline underline-offset-8">
                Ajouter une réduction
              </span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
