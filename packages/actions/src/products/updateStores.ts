"use server"

import { Store } from "@repo/core/models";
import { updateStoresUseCase } from "@repo/core/usecases";

export const updateStoresAction = async (productId: number, stores: Store[]) => {
    try {
        await updateStoresUseCase(productId, stores.map(store => store.id));
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}