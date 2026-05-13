import { z } from "zod"

export const ShipmentConfSchema = z.object({
    mode_livraison: z.string(),
    zone: z.string(),
    poids_min: z.number(),
    poids_max: z.number(),
    prix: z.number()
});

export type ShipmentConfRequest = z.infer<typeof ShipmentConfSchema>;

export type ShipmentConf = {
    mode_livraison: string;
    zone: string;
    poids_min: number;
    poids_max: number;
    prix: number;
    livraison_zones_pays: {
        code: string;
        livraison_pays: {
            nom: string;
        }
    }[]
}

export type Country = {
    code: string;
    name: string;
}

export type Shipment = {
    zone: string;
    tranches: ShipmentConf[];
    countries: string[];
}

export type ShipmentModeZone = Pick<ShipmentConf, 'mode_livraison' | 'zone'>;
export type CountryCode = Pick<Country, 'code'>;
export type ShipmentZoneCountry = Pick<ShipmentConf, 'mode_livraison' | 'zone'> & CountryCode;
export type Tranche = Pick<ShipmentConf, 'mode_livraison' | 'zone' | 'poids_min' | 'poids_max' | 'prix'>;