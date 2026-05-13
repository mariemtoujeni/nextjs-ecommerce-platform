import { ShipmentConfRequest, Tranche } from "../../models";
import { getInjection } from "../../types";


export const updateTrancheUseCase = async (oldTranche: ShipmentConfRequest, newTranche: ShipmentConfRequest) : Promise<Tranche> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");
    const tranche = shipmentConf.updateTranche(oldTranche, newTranche);        
    return tranche;
}