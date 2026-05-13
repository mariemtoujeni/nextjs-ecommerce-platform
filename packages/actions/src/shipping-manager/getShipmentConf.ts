"use server"

import { Shipment } from "@repo/core/models"
import { readShipmentConfUseCase } from "@repo/core/usecases"

export const getShippingConfAction = async (providerName: string): Promise<Shipment[]> => {
    try {
        const shippingConf = await readShipmentConfUseCase(providerName);
        return shippingConf;
    } catch (error: any) {
        throw error;
    }
}