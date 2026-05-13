import { Country } from "../../models";
import { getInjection, ReturnAll } from "../../types";

export const listCountriesWithoutTVAUseCase = async (): Promise<ReturnAll<Country>> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");
    
    const codes = await shipmentConf.readCodeCountriesWithoutTVA();
    if (!codes) {
        throw new Error("Codes countries not found");
    }

    const countries = await shipmentConf.readAllCountries();
    if (!countries) {
        throw new Error("Countries not found");
    }

    const codesArray = codes.map((code: { code: string }) => code.code);
    const countriesWithoutTVA = countries.items.filter((country: Country) => {
        return codesArray.includes(country.code);
    });

    return {
        total: countriesWithoutTVA.length,
        count: countries.count,
        items: countriesWithoutTVA,
    };
}