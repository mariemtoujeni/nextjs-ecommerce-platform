"use server"

import { Country } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { deleteCodeCountriesWithoutTVAUseCase } from "@repo/core/usecases";

export const deleteCodeCountryToListWithoutTVAAction = async (code: string): Promise<ReturnAll<Country>> => {
    try {
        const countries = await deleteCodeCountriesWithoutTVAUseCase(code);
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