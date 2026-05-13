'use client';
import { createContext, useContext, useState } from "react";

interface ProductSelectionContextType {
  selectedModelId: number | null;  
  setSelectedModelId: React.Dispatch<React.SetStateAction<number | null>>;
  currentImageUrl: string | null;
  setCurrentImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProductSelectionContext = createContext<ProductSelectionContextType | undefined>(undefined);

export const ProductSelectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  return (
    <ProductSelectionContext.Provider
      value={{ selectedModelId, setSelectedModelId, currentImageUrl, setCurrentImageUrl }}
    >
      {children}
    </ProductSelectionContext.Provider>
  );
}

export const useProductSelection = () => {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error("useProductSelection must be used within ProductSelectionProvider");
  }
  return context;
};
