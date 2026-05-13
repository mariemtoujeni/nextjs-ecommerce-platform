"use server";

import { CartActionType, ReturnCart } from "@repo/core/models";
import { addToCartUseCase } from "@repo/core/usecases";


export const addToCartAction = async (type: CartActionType, modelId: number, quantity?: number, customization?: number | null,textPersonnalisation?: string, typePersonnalisation?:string): Promise<ReturnCart> => {
  try {
    const result = await addToCartUseCase({
      type,
      userId: "",
      modelId: modelId,
      quantity: quantity ?? 1,
      customizationId: customization,
      textPersonnalisation: textPersonnalisation || "",
      typePersonnalisation: typePersonnalisation || "",
    });    
    return result;
    
  } catch (error: any) {
    return {
      outOfStock: true,
      items: [],
      error: error
    };
  }
};
