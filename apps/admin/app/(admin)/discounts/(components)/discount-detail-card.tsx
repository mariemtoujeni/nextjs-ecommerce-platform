"use client";
import { Discount, ReductionValueType } from "@repo/core/models";
import { updateDiscountAction } from "@repo/actions/discounts";
import { TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "~/components/ui";
import { useRouter } from "next/navigation";
interface Props {
  discount: Discount;
}

type DiscountUIType = "percentage" | "amount" | "free";

export const DiscountDetailCard: React.FC<Props> = ({ discount }: Props) => {
  const [type, setType] = useState<DiscountUIType>("percentage");
  const [value, setValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter()
  const discountLine = discount.discountLines?.[0];

  useEffect(() => {
    if (!discountLine) return;

    let uiType: DiscountUIType;
    if (discountLine.type_valeur === ReductionValueType.MONTANT && discountLine.valeur === 0) {
      uiType = "free";
    } else if (discountLine.type_valeur === ReductionValueType.PERCENTAGE && discountLine.valeur === 100) {
      uiType = "free";
    } else {
      uiType = discountLine.type_valeur === ReductionValueType.MONTANT ? "amount" : "percentage";
    }

    setType(uiType);
    setValue(discountLine.valeur?.toString() ?? "");
  }, [discountLine]);

  const getSuffix = () => {
    if (type === "percentage") return "%";
    if (type === "amount") return "€";
    return "€"; // For free
  };

  const isFree = type === "free";

  const hasChanged = (): boolean => {
    if (!discountLine) return false;

    const backendType = discountLine.type_valeur;
    const backendValue = discountLine.valeur ?? 0;

    const currentType = type === "amount" ? ReductionValueType.MONTANT : ReductionValueType.PERCENTAGE;
    const currentValue = type === "free" ? backendType === ReductionValueType.MONTANT ? 0 : 100 : parseFloat(value || "0");

    return backendType !== currentType || backendValue !== currentValue;
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!discountLine) return;
      if (!hasChanged()) return;

      setIsUpdating(true);

      const updatedDiscount: Discount = {
        ...discount,
        discountLines: [
          {
            ...discountLine,
            type_valeur: type === "amount" ? ReductionValueType.MONTANT : ReductionValueType.PERCENTAGE,
            valeur: type === "free" ? discountLine.type_valeur === ReductionValueType.MONTANT ? 0 : 100 : parseFloat(value || "0"),
          },
        ],
      };
      await updateDiscountAction(updatedDiscount);
      router.refresh();
      setIsUpdating(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [type, value]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <TicketPercent size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">Détails de la réduction</span>
          </CardTitle>
            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                Mise à jour...
              </div>
            )}
        </div>
      </CardHeader>

      <CardContent className="flex gap-3 items-end">
        <div className="space-y-1 w-1/2">
          <Label htmlFor="type" className="text-sm font-medium text-gray-700">
            Type
          </Label>
          <Select
            value={type}
            onValueChange={(val) => {
              setType(val as DiscountUIType);
              if (val === "free") {
                setValue("0");
              } else if (value === "0") {
                setValue(""); // Reset from free
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une méthode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount">€</SelectItem>
              <SelectItem value="percentage">%</SelectItem>
              <SelectItem value="free">Gratuit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 w-1/2">
          <Label htmlFor="value" className="text-sm font-medium text-gray-700">
            Valeur
          </Label>
          <div className="relative">
            <Input
              id="value"
              value={value}
              onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) { setValue(e.target.value); } }}
              placeholder="Ex: 20"
              className="bg-gray-50 pr-10"
              disabled={isFree}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
              {getSuffix()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
