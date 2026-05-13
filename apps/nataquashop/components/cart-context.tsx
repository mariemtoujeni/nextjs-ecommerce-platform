'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getCartAction } from "@repo/actions/cart"; // adjust path as needed

type CartContextType = {
  cartCount: number;
  syncCartCount: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const syncCartCount = async () => {
    try {
      const cartItems = await getCartAction();
      setCartCount(cartItems.items.length);
    } catch (e) {
      console.error("Failed to sync cart count", e);
    }
  };

  // Sync on mount so the count is fresh initially
  React.useEffect(() => {
    syncCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, syncCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
