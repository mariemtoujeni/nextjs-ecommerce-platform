"use server"
import { ProductAdd, ProductWithAdmin } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { addProductUseCase } from "@repo/core/usecases";

export const addProductAction = async (product: ProductAdd): Promise<ReturnOne<ProductWithAdmin>> => {
    try {
        const createdProduct = await addProductUseCase(product);
        return {
            item: createdProduct
        };
    } catch (error: any) {
        console.error(error);
        return {
            item: {} as ProductWithAdmin,
            error: error
        }
    }
}