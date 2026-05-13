import { Country } from "../../models";
import { getInjection } from "../../types";

export const listCountriesWithoutZonesUseCase = async (carrier?: string): Promise<Country[]> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");
    
    const shippingsZonesCountries = await shipmentConf.readShippingsZonesCountries(carrier);
    if (!shippingsZonesCountries) {
        throw new Error("Shippings zones countries not found");
    }

    const countries = await shipmentConf.readAllCountries();
    if (!countries) {
        throw new Error("Countries not found");
    }

    const countriesWithoutZone = countries.items.filter((country: Country) => {
        return !shippingsZonesCountries.some((shippingZoneCountry) => shippingZoneCountry.code === country.code);
    });

    return countriesWithoutZone;
}