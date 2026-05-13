"use server"
import { Product } from "@repo/core/models";
import { getProductsBySousCategorie } from "@repo/core/usecases";

export const getProductBySousCategorieAction = async (productId: number): Promise<Product[]> => {
    const products = await getProductsBySousCategorie(productId);
    return products.slice(0, 4);
    
}