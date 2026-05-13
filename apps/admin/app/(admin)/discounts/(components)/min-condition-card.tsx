"use client";
import { updateDiscountAction } from "@repo/actions/discounts";
import { Discount, MinPurchaseCondition } from "@repo/core/models";
import { CheckCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, RadioGroup, RadioGroupItem, } from "~/components/ui";

interface Props {
  discount: Discount;
}

export const MinConditionCard: React.FC<Props> = ({ discount }: Props) => {
  const router = useRouter();

  const [type, setType] = useState<MinPurchaseCondition>(discount.type_condition_achat_min || MinPurchaseCondition.MONTANT);
  const [value, setValue] = useState<string>(discount.valeur_condition_achat_min?.toString() || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const lastSaved = useRef({
    type: discount.type_condition_achat_min || MinPurchaseCondition.MONTANT,
    value: discount.valeur_condition_achat_min?.toString() || ""
  });

  const getSuffix = () => (type === MinPurchaseCondition.MONTANT ? "€" : "X");

  const save = async (newType: MinPurchaseCondition, newValue: string) => {
    // Avoid duplicate saves
    if (lastSaved.current.type === newType && lastSaved.current.value === newValue) return;

    lastSaved.current = { type: newType, value: newValue };
    setIsUpdating(true);
    try {
      await updateDiscountAction({
        id: discount.id,
        type_condition_achat_min: newType,
        valeur_condition_achat_min: parseFloat(newValue) || 0,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
    setIsUpdating(false);
  };

  const handleTypeChange = (newType: MinPurchaseCondition) => {
    setType(newType);
    save(newType, value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Enforce numeric only
    if (/^\d*$/.test(newValue)) {
      setValue(newValue);
    }
  };

  const handleBlur = () => {
    save(type, value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <CheckCircleIcon size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">Conditions d&apos;achat minimum</span>
          </CardTitle>
          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              Mise à jour...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Radio Group */}
        <div className="space-y-2">
          <RadioGroup value={type} onValueChange={handleTypeChange} className="space-y-2" >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={MinPurchaseCondition.MONTANT} id="montant" />
              <Label htmlFor="montant" className="text-sm">Montant minimum d&apos;achat (€)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={MinPurchaseCondition.QUANTITE_PRODUIT} id="quantite" />
              <Label htmlFor="quantite" className="text-sm">Quantité minimum d&apos;article</Label>
            </div>
          </RadioGroup>
        </div>
        {/* Input Field */}
        <div className="w-full space-y-1">
          <Label htmlFor="value" className="text-sm font-medium text-gray-700">
            Valeur
          </Label>
          <div className="relative w-36"> 
            <Input
              id="value"
              value={value}
              onChange={handleValueChange}
              onBlur={handleBlur}
              placeholder="Ex: 10"
              className="bg-gray-50 pr-10 w-full" 
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
