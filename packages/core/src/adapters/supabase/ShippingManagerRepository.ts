import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError, InternalServerError } from "../../types/error";
import { ICarrierRepository } from "../../repositories/IShippingManagerRepository";
import { ShipmentConf, ShipmentModeZone, ShipmentZoneCountry, Tranche, ShipmentConfRequest, Country, CountryCode } from "../../models/ShipmentConf";
import { ReturnAll } from "../../types";

export class ShippingManagerRepository implements ICarrierRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async readAllShipingProviders(): Promise<ShipmentModeZone[]> {
        const { data, error } = await this.supabase.from('livraisons').select('*');
        if (error) {
            throw new BadRequestError(error.message);
        }

        const shipmentModeZones: ShipmentModeZone[] = [];
        data.forEach((shipmentConf: ShipmentConf) => {
            const { mode_livraison, zone } = shipmentConf;
            const shipmentModeZone = shipmentModeZones.find((smz: ShipmentModeZone) => smz.mode_livraison === mode_livraison);
            if (shipmentModeZone) {
                const zones = new Set(shipmentModeZone.zone.split(', ').concat(zone));
                shipmentModeZone.zone = Array.from(zones).join(', ');
            } else {
                shipmentModeZones.push({ mode_livraison, zone });
            }
        });

        return shipmentModeZones;
    }

    async readShipmentConf(provider: string): Promise<ShipmentConf[]> {        
        const livraisons = await this.supabase.from('livraisons').select('*').eq('mode_livraison', provider);
        if (livraisons.error) {
            throw new BadRequestError(livraisons.error.message);
        }

        const zones = livraisons.data.map((livraison) => livraison.zone);
        const livraisonZonesPays = await this.supabase.from('livraison_zones_pays')
            .select('*').eq('mode_livraison', provider).in('zone', zones);
        if (livraisonZonesPays.error) {
            throw new InternalServerError(livraisonZonesPays.error.message);
        }

        const paysCodes = livraisonZonesPays.data.map((zonePays) => zonePays.pays);
        const livraisonPays = await this.supabase.from('livraison_pays').select('*').in('code', paysCodes);
        if (livraisonPays.error) {
            throw new InternalServerError(livraisonPays.error.message);
        }

        const livraisonPaysMap = new Map(
            livraisonPays.data.map((pays) => [pays.code, pays.nom])
        );

        const livraisonObjects: ShipmentConf[] = livraisons.data.map((livraison) => {
            const zonesPays = livraisonZonesPays.data.filter(
                (zonePays) => zonePays.zone === livraison.zone
            );

            return {
                mode_livraison: livraison.mode_livraison,
                zone: livraison.zone,
                poids_min: livraison.poids_min,
                poids_max: livraison.poids_max,
                prix: livraison.prix,
                livraison_zones_pays: zonesPays.map((zonePays) => ({
                    code: zonePays.pays,
                    livraison_pays: {
                        nom: livraisonPaysMap.get(zonePays.pays) || "Unknown",
                    },
                })),
            };
        });

        return livraisonObjects;
    }

    async readCodeCountriesWithoutTVA() : Promise<CountryCode[]> {        
        const { data, error } = await this.supabase.from('pays_sans_tva').select('*');
        if (error) {
            throw new BadRequestError(error.message);
        }
        const countries : CountryCode[] = data.map((country: any) => ({
            code: country.code
        }));
        return countries;
    }

    async readAllCountries(): Promise<ReturnAll<Country>> {        
        const allCountries = await this.supabase.from('livraison_pays').select('*', { count: 'exact' });
        if (allCountries.error) {
            throw new BadRequestError(allCountries.error.message);
        }
        const countries : Country[] = allCountries.data.map((country: any) => ({
            code: country.code,
            name: country.nom
        }));
        return {
            total: allCountries.data.length,
            count: allCountries.count ?? 0,
            items: countries,
        };
    }

    async createCodeCountriesWithoutTVA(code: string): Promise<CountryCode> {
        const { data, error } = await this.supabase.from('pays_sans_tva').insert({ code }).select('*').single();
        if (error) {
            throw new BadRequestError(error.message);
        }
        return { code: data.code };
    }

    async deleteCodeCountriesWithoutTVA(code: string): Promise<void> {
        const { error } = await this.supabase.from('pays_sans_tva').delete().eq('code', code);
        if (error) {
            throw new BadRequestError(error.message);
        }
    }

    async readShippingsZonesCountries(carrier?: string): Promise<ShipmentZoneCountry[]> {
        let dataCarrier: any;
        if (carrier) {
            const { data, error } = await this.supabase.from('livraison_zones_pays').select('*').eq('mode_livraison', carrier);
            if (error) {
                throw new BadRequestError(error.message);
            }
            dataCarrier = data;
        } else {
            const { data, error } = await this.supabase.from('livraison_zones_pays').select('*');
            if (error) {
                throw new BadRequestError(error.message);
            }
            dataCarrier = data;
        }

        const shipmentZoneCountries: ShipmentZoneCountry[] = dataCarrier.map((zonePays: any) => ({
            mode_livraison: zonePays.mode_livraison,
            zone: zonePays.zone,
            code: zonePays.pays
        }));

        return shipmentZoneCountries;
    }

    async deleteCountryFromZone(zone: string, country: string, carrier: string): Promise<ShipmentZoneCountry[]> {
        const { error } = await this.supabase.from('livraison_zones_pays').delete().eq('zone', zone).eq('mode_livraison', carrier).eq('pays', country);
        if (error) {
            throw new BadRequestError(error.message);
        }

        const shipmentZoneCountries = await this.readShippingsZonesCountries();
        return shipmentZoneCountries;
    }

    async addCountryToZoneOfCarrier(zone: string, country: string, carrier: string): Promise<ShipmentZoneCountry[]> {
        const { error } = await this.supabase.from('livraison_zones_pays').insert({ zone, mode_livraison: carrier, pays: country });
        if (error) {
            throw new BadRequestError(error.message);
        }
        return this.readShippingsZonesCountries();
    }

    async deleteTrancheFromZone(carrier: string, zone: string, poids_min: number, poids_max: number): Promise<void> {
        const { error } = await this.supabase.from('livraisons').delete().eq('mode_livraison', carrier).eq('zone', zone).eq('poids_min', poids_min).eq('poids_max', poids_max);
        if (error) {
            throw new BadRequestError(error.message);
        }
    }

    async addTrancheToZone(tranche : ShipmentConfRequest): Promise<Tranche> {
        const { data, error } = await this.supabase.from('livraisons').insert({ 
            ...tranche
         }).select('*').single();
        if (error) {
            throw new BadRequestError(error.message);
        }
        return data;
    }

    async updateTranche(oldTranche: ShipmentConfRequest, newTranche: ShipmentConfRequest): Promise<Tranche> {
        const { data, error } = await this.supabase
            .from('livraisons')
            .update({ 
                mode_livraison: newTranche.mode_livraison,
                zone: newTranche.zone,
                poids_min: newTranche.poids_min,
                poids_max: newTranche.poids_max,
                prix: newTranche.prix
             })
            .eq('mode_livraison', oldTranche.mode_livraison)
            .eq('zone', oldTranche.zone)
            .eq('poids_min', oldTranche.poids_min)
            .eq('poids_max', oldTranche.poids_max)
            .select('*')
            .single();

        if (error) {
            throw new BadRequestError(error.message);
        }
        return data;
    }
}