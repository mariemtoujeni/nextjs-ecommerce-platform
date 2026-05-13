"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDeliveryCartAction } from "@repo/actions/cart";

type DeliveryPriceContextType = {
  deliveryCart: { prix: number } | null;
  refreshDeliveryCart: () => Promise<void>;
};

const DeliveryPriceContext = createContext<DeliveryPriceContextType | undefined>(undefined);

export const useDeliveryPrice = () => {
  const context = useContext(DeliveryPriceContext);
  if (!context) throw new Error("useDeliveryPrice must be used within DeliveryPriceProvider");
  return context;
};

export const DeliveryPriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveryCart, setDeliveryCart] = useState<{ prix: number } | null>(null);

    const refreshDeliveryCart = async () => {
    try {
        const cart = await getDeliveryCartAction();
        setDeliveryCart(cart.item);
    } catch (error) {
        setDeliveryCart(null); 
    }
    };

  useEffect(() => {
    refreshDeliveryCart();
  }, []);

  return (
    <DeliveryPriceContext.Provider value={{ deliveryCart, refreshDeliveryCart }}>
      {children}
    </DeliveryPriceContext.Provider>
  );
};
