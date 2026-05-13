"use client";
import React, { createContext, useContext, useCallback, useRef, useTransition } from "react";
import { updateDeliveryCartAction } from "@repo/actions/cart";
import { OrderDeliveryMode, DeliveryCart } from "@repo/core/models";
import { useRouter } from "next/navigation";

type ShippingContextType = {
  handleDeliveryModeChange: (mode: OrderDeliveryMode, price?: number) => void;
  isUpdating: boolean;
};

const ShippingContext = createContext<ShippingContextType | null>(null);

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error('useShipping must be used within a ShippingTabsWrapper');
  }
  return context;
};

type Props = {
  children: React.ReactNode;
  currentTab: string;
  deliveryCart: DeliveryCart;
};

export const ShippingTabsWrapper: React.FC<Props> = ({ children, currentTab, deliveryCart }: Props) => {
  const router = useRouter();
  const lastModeRef = useRef(deliveryCart.deliveryMode);
  const [isPending, startTransition] = useTransition();

  const handleDeliveryModeChange = useCallback(async (
    mode: OrderDeliveryMode, 
    price?: number
  ) => {
    // Prevent duplicate updates
    if (mode === lastModeRef.current || isPending) {
      return;
    }

    lastModeRef.current = mode;

    try {
      startTransition(async () => {
        await updateDeliveryCartAction({
          deliveryMode: mode,
          prix: price,
          relaisId: mode === OrderDeliveryMode.MONDIAL_RELAY ? deliveryCart.relaisId : ""
        });
        
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update delivery mode:", error);
      // Revert the ref on error
      lastModeRef.current = deliveryCart.deliveryMode;
    }
  }, [deliveryCart.relaisId, deliveryCart.deliveryMode, router, isPending]);

  const contextValue: ShippingContextType = {
    handleDeliveryModeChange,
    isUpdating: isPending
  };

  return (
    <ShippingContext.Provider value={contextValue}>
      {children}
    </ShippingContext.Provider>
  );
};