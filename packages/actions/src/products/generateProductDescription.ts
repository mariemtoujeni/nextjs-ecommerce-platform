"use server"

import { Product } from "@repo/core/models";
import { generateProductDescriptionUseCase } from "@repo/core/usecases";

export const generateProductDescriptionAction = async (threadId: string, product: Product) => {
    const description = await generateProductDescriptionUseCase(threadId, product);
    return description;
}