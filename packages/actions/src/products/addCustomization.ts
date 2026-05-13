"use server"
import { addCustomization } from "@repo/core/usecases"

export const addCustomizationAction = async (productId: number) => {
    return await addCustomization(productId, {
        description: "Nouvelle personnalisation",
        price: 0,
    });
}