import { Shipment, ShipmentConf, Country } from "../../models";
import { getInjection } from "../../types";

export const readShipmentConfUseCase = async (provider : string): Promise<Shipment[]> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");

    const shipmentLines : ShipmentConf[] = await shipmentConf.readShipmentConf(provider);

    if (!shipmentLines) {
        throw new Error("Shipment not found");
    }

    const zones = shipmentLines.map((shipmentLine: ShipmentConf) => {
        return shipmentLine.zone;
    });
    // remove duplicates
    const uniqueZones = Array.from(new Set(zones));

    const countries = shipmentLines.map((shipmentLine: ShipmentConf) => {
        return shipmentLine.livraison_zones_pays.map((country) => {
            return {
                code: country.code,
                name: country.livraison_pays.nom,
                zone: shipmentLine.zone
            };
        });
    });    
    
    
    const shipments = uniqueZones.map((zone) => {
        return {
            zone: zone,
            tranches: shipmentLines.filter((shipmentLine: ShipmentConf) => shipmentLine.zone === zone),                        
            countries:  Array.from(new Set(countries.flat().filter((country) => country.zone === zone).map((country: Country) => {
                return country.name
            })))                                
        };
    });

    return shipments;
}