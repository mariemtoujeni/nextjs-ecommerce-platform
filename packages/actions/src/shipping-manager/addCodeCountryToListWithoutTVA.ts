"use server"

import { Country } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listCountriesWithTVAUseCase, createCodeCountriesWithoutTVAUseCase } from "@repo/core/usecases";

export const addCodeCountryToListWithoutTVAAction = async (code: string): Promise<ReturnAll<Country>> => {
    try {
        await createCodeCountriesWithoutTVAUseCase(code);
        const countries = await listCountriesWithTVAUseCase();
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