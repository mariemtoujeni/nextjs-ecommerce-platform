"use client";
import React, { startTransition, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { addToCartAction } from "@repo/actions/cart";
import { CartActionType } from "@repo/core/models";
import { useRouter } from "next/navigation";

interface QuantitySelectorProps {
  value: number;
  modelId: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  modelId,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const router = useRouter();
  const handleChange = (newValue: number) => {
    if (newValue < 1) return;

    const isIncrement = newValue > internalValue;
    setInternalValue(newValue);
    startTransition(() => {
      addToCartAction(
        isIncrement ? CartActionType.INCREMENT : CartActionType.DECREMENT,
        modelId
      );
    router.refresh()
    });
  };

// const numericTotalPrice = React.useMemo(
//   () => parseFloat(price.replace(/[^\d.,-]/g, "").replace(",", ".")),
//   [price]
// );

// const unitPrice = numericTotalPrice / value;

// const totalPrice = (internalValue * unitPrice).toFixed(2) + " €";


  return (
      <div className="flex items-stretch border border-black bg-white hover:shadow-md transition-shadow duration-300">
        <button
          type="button"
          className="px-2 py-1 border-r border-black hover:bg-lime transition-colors duration-300"
          onClick={() => handleChange(internalValue - 1)}
          disabled={internalValue <= 1}
          aria-label="Diminuer la quantité"
        >
          <Minus size={12} />
        </button>
        <span className="px-4 py-1 text-lg text-sm select-none min-w-[2ch] text-center">
          {value}
        </span>
        <button
          type="button"
          className="px-2 py-1 border-l border-black hover:bg-lime transition-colors duration-300"
          onClick={() => handleChange(internalValue + 1)}
          aria-label="Augmenter la quantité"
        >
          <Plus size={12} />
        </button>
      </div>
  );
};
