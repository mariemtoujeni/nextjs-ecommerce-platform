"use server"

import { Address, defaultAddress } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { updateAddressUseCase } from "@repo/core/usecases";

export const updateAddressAction = async (address: defaultAddress):Promise<ReturnOne<Address>>=>{
    try {
         const updatedAddress = await updateAddressUseCase(address);
        return {
            item: updatedAddress
        };
    } catch (error: any) {
            console.error("Error updating address:", error);
        return {
            item: {} as Address,
            error: error
        };
    }
}
