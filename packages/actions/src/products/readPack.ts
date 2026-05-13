"use server"
import { Product, ProductPack } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { readPackUseCase } from "@repo/core/usecases";


export const readPackAction = async (productId: number): Promise<ReturnAll<ProductPack>> => {

    try {
        const pack = await readPackUseCase(productId);
        return {
            items: pack,
            count: pack.length,
            total: pack.length
        };
    } catch (error: any) {
        console.error("Error reading package produit", error);
        return {
            items: [],
            count: 0,
            total: 0,
            error: error
        }
    }

}