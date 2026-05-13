"use server"

import { Country } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listCountriesWithoutTVAUseCase } from "@repo/core/usecases";

export const getCountriesWithoutTVAAction = async (): Promise<ReturnAll<Country>> => {
    try {
        const countries = await listCountriesWithoutTVAUseCase();
        return countries;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        } as ReturnAll<Country>;
    }
}