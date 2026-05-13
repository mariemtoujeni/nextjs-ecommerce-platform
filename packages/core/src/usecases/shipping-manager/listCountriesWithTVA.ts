import { Country } from "../../models";
import { getInjection, ReturnAll } from "../../types";

export const listCountriesWithTVAUseCase = async (): Promise<ReturnAll<Country>> => {
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

    // Filter the countries based on the codes: display the countries that are not in the codes
    const countriesWithTVA = countries.items.filter((country: Country) => {
        return !codesArray.includes(country.code);
    });
        
    return {
        total: countriesWithTVA.length,
        count: countries.count,
        items: countriesWithTVA,
    };
}