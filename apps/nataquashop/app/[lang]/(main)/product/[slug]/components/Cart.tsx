'use client';

import { getUserAction } from "@repo/actions/auth";
import { addToCartAction } from "@repo/actions/cart";
import { CartActionType, Product } from "@repo/core/models";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "~/components/cart-context";
import { Button } from "~/components/ui";
import { useProductSelection } from "./ProductSelectionContext";
import { dictionary } from "~/app/dictionaries";

interface CartProps {
  product: Product;
  translations: dictionary;
  customizationId?: number | null;
  personnalisationText?: string;
  personnalisationType?:string;
}

export const Cart = ({ product, translations, customizationId, personnalisationText,personnalisationType }: CartProps) => {
  const { selectedModelId } = useProductSelection();
  const { syncCartCount } = useCart();
  const [count, setCount] = useState(1);
  const [stockDisponible, setStockDisponible] = useState<number | null>(null);
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isOutOfStock = stockDisponible !== null && stockDisponible <= product.minStock;
  const isAddToCartDisabled = !selectedModelId || isOutOfStock;

  const maxCount = stockDisponible !== null ? stockDisponible - product.minStock : 0;
  const remaining = maxCount;

  const increment = () => {
    if (count < maxCount) setCount(prev => prev + 1);
  };

  const decrement = () => {
    if (count > 1) setCount(prev => prev - 1);
  };

  useEffect(() => {
    const matched = product.modelAttributs?.find(model => model.id === selectedModelId);
    setStockDisponible(matched ? matched.stock : null);
  }, [product.modelAttributs, selectedModelId]);

  const handleAddToCart = async () => {
    if (isAddToCartDisabled || !selectedModelId) return;
    try {
      await addToCartAction(CartActionType.BULK_ADD, selectedModelId, count, customizationId,personnalisationText, personnalisationType);
      
    } catch (err) {
      console.error("Error adding to cart:", err);
      return;
    }

    try {
      await syncCartCount();
    } catch (err) {
      console.error("Error syncing cart count:", err);
    }
    setStockDisponible(prev => (prev !== null ? prev - count : prev));
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleBuy = async () => {
    if (isAddToCartDisabled || !selectedModelId) return;

    try {
      await addToCartAction(CartActionType.BULK_ADD, selectedModelId, count, customizationId);
    } catch (err) {
      console.error("Error adding to cart:", err);
      return;
    }

    let user;
    try {
      user = await getUserAction();
    } catch (err) {
      console.error("Error fetching user:", err);
      return;
    }

    if (user.is_anonymous) {
      router.push("/signin?redirect=/cart/shipping");
    } else {
      router.push("/cart/shipping");
    }
  };

  useEffect(() => {
    setCount(1);
  }, [selectedModelId]);

  if (stockDisponible === null) return null;

  return (
    <div>
      {stockDisponible > product.minStock ? (
        <>
          <div className="flex items-center gap-4">
            <div className="flex border border-black w-32 text-center">
              <button
                onClick={decrement}
                className="flex-1 border-r border-black py-1 hover:bg-gray-200"
                disabled={count <= 1}
              >
                -
              </button>
              <div className="flex-1 border-r border-black py-1">{count}</div>
              <button
                
                onClick={increment}
                className="flex-1 py-1 hover:bg-gray-200"
                
                disabled={count >= maxCount}
              >
                +
              </button>
            </div>

            {[3, 2].includes(remaining) && (
              <span className="text-orange-600 text-sm font-medium whitespace-nowrap">
                {translations.cart.moreOne} {remaining} {translations.cart.inStock}
              </span>
            )}
            {remaining === 1 && (
              <span className="text-red-600 text-sm font-semibold whitespace-nowrap">
                {translations.cart.last}
              </span>
            )}
          </div>

          <div className="mt-[20px] flex flex-col gap-2">
            <div
              className={`overflow-hidden text-green-600 font-medium transition-all duration-500
                ${showSuccessMessage ? "opacity-100 max-h-10" : "opacity-0 max-h-0"}
              `}
            >
              {translations.cart.added}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="default"
                size="lg"
                hasIcon={true}
                icon={ShoppingCart}
                className="normal-case"
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
              >
                {translations.home.trending.products.speedo.addToCart}
              </Button>             
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
