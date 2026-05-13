import { InternalServerError } from '../../types/error';
import { ShipmentConf, ShipmentModeZone, Country, CountryCode, ShipmentZoneCountry, Tranche, ShipmentConfRequest } from '../../models';
import { ICarrierRepository } from '../../repositories';
import { SharedMemory } from './SharedMemory';
import { ReturnAll } from '../../types';

export class MockShippingManagerRepository implements ICarrierRepository {
    async readAllShipingProviders(): Promise<ShipmentModeZone[]> {
        const shipmentConfs = SharedMemory.shipmentConfs;
        
        // shipmentConfs une liste contenant plusieurs occurence de mode_livraison par zone différente, ici on veut regrouper les occurences de mode_livraison et concaténer les zones
        const shipmentModeZones: ShipmentModeZone[] = [];
        shipmentConfs.forEach((shipmentConf: ShipmentConf) => {
            const { mode_livraison, zone } = shipmentConf;
            const shipmentModeZone = shipmentModeZones.find((smz: ShipmentModeZone) => smz.mode_livraison === mode_livraison);
            if (shipmentModeZone) {
                shipmentModeZone.zone += `, ${zone}`;
            } else {
                shipmentModeZones.push({ mode_livraison, zone });
            }
        });
        return shipmentModeZones;
    }

    async readShipmentConf(provider: string): Promise<ShipmentConf[]> {
        const shipmentConfs = SharedMemory.shipmentConfs;
        const shipmentConf = shipmentConfs.filter((shipmentConf: ShipmentConf) => shipmentConf.mode_livraison === provider);
        if (!shipmentConf) {
            throw new Error('Shipment not found');
        }
        return shipmentConf;
    }


    async readCodeCountriesWithoutTVA() : Promise<CountryCode[]> {
        const countries = SharedMemory.countriesWithoutTva;
        if (!countries) {
            throw new Error('Countries not found');
        }
        return countries;
    }

    async readAllCountries(): Promise<ReturnAll<Country>> {
        const countries = SharedMemory.countries;
        if (!countries) {
            throw new Error('Countries not found');
        }

        return {
            total: countries.length,
            count: countries.length,
            items: countries,
        };        
    }

    async createCodeCountriesWithoutTVA(code: string): Promise<CountryCode> {
        const countryCode = { code };
        SharedMemory.countriesWithoutTva.push(countryCode);
        return countryCode;
    }

    async readShippingsZonesCountries(carrier?: string): Promise<ShipmentZoneCountry[]> {
        const shipmentsZonesCountries = carrier ? SharedMemory.shipmentsZonesCountries.filter((shipmentZoneCountry: ShipmentZoneCountry) => shipmentZoneCountry.mode_livraison === carrier) : SharedMemory.shipmentsZonesCountries;
        if (!shipmentsZonesCountries) {
            throw new Error('Shipments zones countries not found');
        }
        return shipmentsZonesCountries;
    }

    async deleteCountryFromZone(zone: string, countryCode: string, carrier: string): Promise<ShipmentZoneCountry[]> {
        SharedMemory.shipmentsZonesCountries = SharedMemory.shipmentsZonesCountries.filter(
            (shipmentZoneCountry: ShipmentZoneCountry) => {
                return shipmentZoneCountry.zone !== zone || shipmentZoneCountry.mode_livraison !== carrier || shipmentZoneCountry.code !== countryCode;
            }
        )

        if (SharedMemory.shipmentsZonesCountries.length === 0) {
            throw new Error('Shipments zones countries not found');
        }
        
        return SharedMemory.shipmentsZonesCountries;
    }

    async deleteCodeCountriesWithoutTVA(code: string): Promise<void> {
        SharedMemory.countriesWithoutTva = SharedMemory.countriesWithoutTva.filter((countryCode: CountryCode) => countryCode.code !== code);
    }   

    async addCountryToZoneOfCarrier(zone: string, countryCode: string, carrier: string): Promise<ShipmentZoneCountry[]> {            
        SharedMemory.shipmentsZonesCountries.push({
            mode_livraison: carrier,
            zone: zone,
            code: countryCode
        });

        return this.readShippingsZonesCountries();
    }

    async deleteTrancheFromZone(carrier: string, zone: string, poids_min: number, poids_max: number): Promise<void> {
        SharedMemory.shipmentConfs = SharedMemory.shipmentConfs.filter(
            (shipmentConf: ShipmentConf) => {
                return shipmentConf.zone !== zone || shipmentConf.mode_livraison !== carrier || shipmentConf.poids_min !== poids_min || shipmentConf.poids_max !== poids_max;
            }
        )
    }

    async addTrancheToZone(tranche : ShipmentConfRequest): Promise<Tranche> {
        SharedMemory.shipmentConfs.push({
            mode_livraison: tranche.mode_livraison,
            zone: tranche.zone,
            poids_min: tranche.poids_min,
            poids_max: tranche.poids_max,
            prix: tranche.prix,
            livraison_zones_pays: []
        });

        const tranches : ShipmentConf[] = await this.readShipmentConf(tranche.mode_livraison);
        const newTranche = tranches.find((p_tranche) => p_tranche.mode_livraison === tranche.mode_livraison && p_tranche.zone === tranche.zone &&
                            p_tranche.poids_max === tranche.poids_max && p_tranche.poids_min === tranche.poids_min);
        if(!newTranche)
            throw new InternalServerError("");
        
        return {
            mode_livraison: newTranche.mode_livraison,
            zone: newTranche.zone,
            poids_min: newTranche.poids_min,
            poids_max: newTranche.poids_max,
            prix: newTranche.prix
        }
    }

    async updateTranche(oldTranche: ShipmentConfRequest, newTranche: ShipmentConfRequest): Promise<Tranche> {
        const index = SharedMemory.shipmentConfs.findIndex(
            tranche => tranche.mode_livraison === oldTranche.mode_livraison &&
                      tranche.zone === oldTranche.zone &&
                      tranche.poids_min === oldTranche.poids_min &&
                      tranche.poids_max === oldTranche.poids_max
        );

        if (index === -1) {
            throw new Error('Tranche not found');
        }

        SharedMemory.shipmentConfs[index] = {
            mode_livraison: newTranche.mode_livraison,
            zone: newTranche.zone,
            poids_min: newTranche.poids_min,
            livraison_zones_pays: SharedMemory.shipmentConfs[index] ? SharedMemory.shipmentConfs[index].livraison_zones_pays : [],
            poids_max: newTranche.poids_max,
            prix: newTranche.prix
        };

        return {
            mode_livraison: newTranche.mode_livraison,
            zone: newTranche.zone,
            poids_min: newTranche.poids_min,
            poids_max: newTranche.poids_max,
            prix: newTranche.prix
        };
    }   
}