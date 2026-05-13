"use server"
import { ProductUpdate } from "@repo/core/models";
import { updateProductUseCase } from "@repo/core/usecases";

export const updateProductAction = async (productId: number, product: ProductUpdate) => {
    try {
        await updateProductUseCase(productId, product);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}