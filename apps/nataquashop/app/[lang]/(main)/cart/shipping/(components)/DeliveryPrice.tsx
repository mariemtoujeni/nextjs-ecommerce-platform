"use client";

import React from "react";
import { useDeliveryPrice } from "./DeliveryPriceContext";

interface DeliveryPriceProps {
  dict: any;
}

const DeliveryPrice: React.FC<DeliveryPriceProps> = ({ dict }) => {
  const { deliveryCart } = useDeliveryPrice();

  if (!deliveryCart) {
    return (
      <span className="text-sm font-semibold text-muted-foreground mb-1 block">
        {dict.deliveryCart.deliveryPrice} ...
      </span>
    );
  }

  return (
    <span className="text-sm font-semibold text-muted-foreground mb-1 block">
      {dict.deliveryCart.deliveryPrice} {deliveryCart.prix} €
    </span>
  );
};

export default DeliveryPrice;
