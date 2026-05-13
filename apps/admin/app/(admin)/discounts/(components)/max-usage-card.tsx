"use client";
import { Discount } from "@repo/core/models";
import { updateDiscountAction } from "@repo/actions/discounts";
import { RepeatIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Switch, } from "~/components/ui";
import { useRouter } from "next/navigation";

interface Props {
  discount: Discount;
}

export const MaxUsageCard: React.FC<Props> = ({ discount }: Props) => {
  const router = useRouter();

  const initialValue = discount.nombre_maximal_utilisation;
  const [isLimited, setIsLimited] = useState(initialValue >= 0);
  const [usageLimit, setUsageLimit] = useState<string>(
    initialValue >= 0 ? initialValue.toString() : ""
  );

  const [isUpdating, setIsUpdating] = useState(false);

  const saveUsageLimit = async (value: number) => {
    setIsUpdating(true);
    try {
      await updateDiscountAction({
        id: discount.id,
        nombre_maximal_utilisation: value,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
    setIsUpdating(false);
  };

  const handleLimitToggle = (checked: boolean) => {
    if (checked) {
      setIsLimited(true);
      setUsageLimit("0"); 
      saveUsageLimit(0);
    } else {
      setIsLimited(false);
      setUsageLimit("");
      saveUsageLimit(-1); 
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <RepeatIcon size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">
              Nombre maximum d’utilisations de la réduction
            </span>
          </CardTitle>
          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              Mise à jour...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <Label htmlFor="enableUsageLimit" className="cursor-pointer select-none text-sm font-medium text-gray-700">
            Limiter le nombre total d’utilisations de cette réduction
          </Label>
          <Switch id="enableUsageLimit" checked={isLimited} onCheckedChange={handleLimitToggle} />
        </div>
        {isLimited && (
          <div className="flex flex-col gap-1 px-2">
            <Label htmlFor="usageLimitInput" className="text-sm font-medium text-gray-700">
              Nombre maximum d’utilisations
            </Label>
            <Input
              type="text"
              placeholder="Ex: 50"
              value={usageLimit}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setUsageLimit(value);
                  setIsLimited(parseInt(value || "0", 10) > 0);
                }
              }}
              onBlur={() => {
                const numericValue = usageLimit === "" ? -1 : parseInt(usageLimit, 10);
                saveUsageLimit(numericValue);
              }}
              className="w-1/6 bg-gray-50"
            />

          </div>
        )}
      </CardContent>
    </Card>
  );
};
