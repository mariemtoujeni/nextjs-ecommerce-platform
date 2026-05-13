"use server"
import { OnlineShop } from "@repo/core/models";
import { updateOnlineShops } from "@repo/core/usecases";

export const updateOnlineShopsAction = async (productId: number, onlineShops: OnlineShop[]) => {
    try {
        await updateOnlineShops(productId, onlineShops);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}