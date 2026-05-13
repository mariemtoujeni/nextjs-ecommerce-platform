"use server"

import { ShipmentZoneCountry } from "@repo/core/models";
import { addCountryToZoneOfCarrierUseCase } from "@repo/core/usecases";

export const addCountryToZoneOfCarrierAction = async (zone: string, country: string, carrier: string): Promise<ShipmentZoneCountry[]> => {
    try {
        const countries = await addCountryToZoneOfCarrierUseCase(zone, country, carrier);
        return countries;
    } catch (error: any) {
        throw error;
    }
}