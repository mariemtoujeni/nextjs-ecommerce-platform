import { ShipmentModeZone } from "../../models";
import { getInjection } from "../../types";

export type filterExpediteurRequest = {
    mode_livraison?: string;
    zone?: string;
}

export const listShipmentConfUseCase = async (request?: filterExpediteurRequest | string): Promise<ShipmentModeZone[]> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");

    const expediteurs = await shipmentConf.readAllShipingProviders();

    if(!request) 
        return expediteurs;

    const filteredExpediteur = expediteurs.filter(
        (expediteur) => {
            if(typeof request === 'string') {
                return expediteur.mode_livraison === request || expediteur.zone.includes(request);
            } else if (request.mode_livraison && request.mode_livraison === expediteur.mode_livraison) {
                return true;
            } else if (request.zone &&  expediteur.zone.includes(request.zone)) {
                return true;
            } else if(!request.mode_livraison && !request.zone) {
                return true;
            }
            return false;
        }
    );

    return filteredExpediteur;
}