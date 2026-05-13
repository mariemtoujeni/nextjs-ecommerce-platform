import { Tranche } from "../../models";
import { getInjection } from "../../types";
import { InternalServerError } from "../../types";

export const deleteTrancheUseCase = async (tranche: Tranche) => {
    const shipmentConf = await getInjection("IShippingManagerRepository");
    try {
        await shipmentConf.deleteTrancheFromZone(tranche.mode_livraison, tranche.zone, tranche.poids_min, tranche.poids_max);
    } catch (error: any) {
        throw new InternalServerError(error.message);
    }
}
