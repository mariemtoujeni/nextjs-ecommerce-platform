import { Country, ShipmentZoneCountry } from "../../models";
import { getInjection } from "../../types";
import { InternalServerError } from "../../types";

export const deleteCountryFromZoneUseCase = async (zone: string, country: string, carrier: string) : Promise<ShipmentZoneCountry[]> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");

    const countries = await shipmentConf.readAllCountries();
    if (!countries) {
        throw new InternalServerError("Countries not found");
    }

    const countryCode = countries.items.find((c: Country) => c.name === country);
    if (!countryCode) {
        throw new InternalServerError("Country not found");
    }

    const newCountryList = await shipmentConf.deleteCountryFromZone(zone, countryCode.code, carrier);
    return newCountryList;
};