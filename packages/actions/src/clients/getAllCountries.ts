"use server"

import { Country } from "@repo/core/models";
import { listAllCountriesUseCase } from "@repo/core/usecases";

export const listAllCountriesAction = async (): Promise<Country[]> => {
    try {
        const countries = await listAllCountriesUseCase();
        return countries;
    } catch (error: any) {
        throw error;
    }
}
