"use client";
import { Discount, DiscountCombination, ReductionType } from "@repo/core/models";
import { updateDiscountAction } from "@repo/actions/discounts"; 
import { LayersIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Label, Switch } from "~/components/ui";
import { useRouter } from "next/navigation";

interface Props {
  discount: Discount;
}

export const CombinationCard: React.FC<Props> = ({ discount }: Props) => {
  const router = useRouter();
  const [productDiscount, setProductDiscount] = useState(discount.combinaison === DiscountCombination.PRODUIT);
  const [orderDiscount, setOrderDiscount] = useState(discount.combinaison === DiscountCombination.COMMANDE);
  const [shippingDiscount, setShippingDiscount] = useState(discount.combinaison === DiscountCombination.EXPEDITION);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleExclusive = (target: "product" | "order" | "shipping") => {
    let newProduct = productDiscount;
    let newOrder = orderDiscount;
    let newShipping = shippingDiscount;

    const isAlreadySelected =
      (target === "product" && productDiscount) ||
      (target === "order" && orderDiscount) ||
      (target === "shipping" && shippingDiscount);

    if (isAlreadySelected) {
      newProduct = false;
      newOrder = false;
      newShipping = false;
    } else {
      newProduct = target === "product";
      newOrder = target === "order";
      newShipping = target === "shipping";
    }

    setProductDiscount(newProduct);
    setOrderDiscount(newOrder);
    setShippingDiscount(newShipping);

    const newCombination: DiscountCombination | null =
      newProduct ? DiscountCombination.PRODUIT :
      newOrder ? DiscountCombination.COMMANDE :
      newShipping ? DiscountCombination.EXPEDITION :
      null;

    saveCombination(newCombination);
  };

  const saveCombination = async (combination: DiscountCombination | null) => {
    setIsUpdating(true);
    try {
      await updateDiscountAction({
        combinaison: combination,
        id: discount.id,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <LayersIcon size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">Combinaisons</span>
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
        <span className="text-xs font-medium text-gray-600 block">
          Cette réduction peut être combinée avec :
        </span>

        {discount.type !== ReductionType.CAMPAGNE && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="product-discount" className="text-sm font-medium text-gray-700">
              Réductions sur un produit
            </Label>
            <Switch
              id="product-discount"
              checked={productDiscount}
              onCheckedChange={() => toggleExclusive("product")}
            />
          </div>
        )}

        {discount.type !== ReductionType.COMMANDE && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="order-discount" className="text-sm font-medium text-gray-700">
              Réductions sur la commande
            </Label>
            <Switch
              id="order-discount"
              checked={orderDiscount}
              onCheckedChange={() => toggleExclusive("order")}
            />
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <Label htmlFor="shipping-discount" className="text-sm font-medium text-gray-700">
            Réductions sur les frais d’expédition
          </Label>
          <Switch
            id="shipping-discount"
            checked={shippingDiscount}
            onCheckedChange={() => toggleExclusive("shipping")}
          />
        </div>
      </CardContent>
    </Card>
  );
};
