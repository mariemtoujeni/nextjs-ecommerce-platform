"use server"

import { Country, ShipmentZoneCountry } from "@repo/core/models";
import { deleteCountryFromZoneUseCase } from "@repo/core/usecases";

export const deleteCountryFromZoneAction = async (zone: string, country: string, carrier: string): Promise<ShipmentZoneCountry[]> => {
    try {
        const countries = await deleteCountryFromZoneUseCase(zone, country, carrier);
        return countries;
    } catch (error: any) {
        throw error;
    }
}