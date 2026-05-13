import { ReturnAll } from '../types';
import { Country, CountryCode, ShipmentModeZone, ShipmentConf, ShipmentZoneCountry, Tranche, ShipmentConfRequest }  from '../models';

export interface ICarrierRepository {
    readAllShipingProviders(): Promise<ShipmentModeZone[]>;
    readShipmentConf(provider: string): Promise<ShipmentConf[]>;
    readAllCountries(): Promise<ReturnAll<Country>>;
    readCodeCountriesWithoutTVA() : Promise<CountryCode[]>;
    readShippingsZonesCountries(carrier?: string) : Promise<ShipmentZoneCountry[]>;
    createCodeCountriesWithoutTVA(code: string): Promise<CountryCode>;
    deleteCodeCountriesWithoutTVA(code: string): Promise<void>;
    deleteCountryFromZone(zone: string, countryCode: string, carrier: string): Promise<ShipmentZoneCountry[]>;
    addCountryToZoneOfCarrier(zone: string, countryCode: string, carrier: string): Promise<ShipmentZoneCountry[]>;
    deleteTrancheFromZone(carrier: string, zone: string, poids_min: number, poids_max: number) : Promise<void>;
    addTrancheToZone(tranche: ShipmentConfRequest) : Promise<Tranche>;
    updateTranche(oldTranche: ShipmentConfRequest, newTranche: ShipmentConfRequest) : Promise<Tranche>;
}