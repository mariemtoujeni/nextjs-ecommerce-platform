"use server"

import { ShipmentModeZone } from "@repo/core/models";
import { filterExpediteurRequest, listShipmentConfUseCase } from "@repo/core/usecases"

export const getShippingConfsAction = async (request?: filterExpediteurRequest | string): Promise<ShipmentModeZone[]> => {
    try {
        const shippingConfs = await listShipmentConfUseCase(request);
        return shippingConfs;
    } catch (error: any) {
        throw error;
    }
}