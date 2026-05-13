"use server"

import { Country } from "@repo/core/models";
import { listCountriesWithoutZonesUseCase } from "@repo/core/usecases";

export const getCountriesWithoutZoneAction = async (carrier?: string): Promise<Country[]> => {
    try {
        const countries = await listCountriesWithoutZonesUseCase(carrier);
        return countries;
    } catch (error: any) {
        throw error;
    }
}