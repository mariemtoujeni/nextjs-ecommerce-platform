"use server"

import { listClientAddressesUseCase } from "@repo/core/usecases";
import { Address } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";

export const listClientAddressesAction = async (type?: string): Promise<ReturnAll<Address>> => {
    try {
        const cart = await listClientAddressesUseCase(type);
        return {
            items: cart,
            total: cart.length,
            count: cart.length,
        };
    } catch (error: any) {
        return {
            items: [],
            total: 0,
            count: 0,    
            error: error        
        };
    }
}