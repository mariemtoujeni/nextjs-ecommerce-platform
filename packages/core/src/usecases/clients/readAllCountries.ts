import { Country } from "../../models";
import { getInjection } from "../../types";

export const listAllCountriesUseCase = async (): Promise<Country[]> => {
    const shipmentRepository = await getInjection('IShippingManagerRepository');

    const countries = await shipmentRepository.readAllCountries();

    return countries.items;
}