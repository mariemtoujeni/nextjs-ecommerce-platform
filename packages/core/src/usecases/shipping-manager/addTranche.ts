import { Tranche } from "../../models";
import { getInjection } from "../../types";
import { InternalServerError } from "../../types";

export const addTrancheUseCase = async (newTranche: Tranche) : Promise<Tranche> => {
    const shipmentConf = await getInjection("IShippingManagerRepository");
    try {
        const tranche = await shipmentConf.addTrancheToZone({
            ...newTranche
        });
        return tranche;
    } catch (error: any) {
        throw new InternalServerError(error.message);
    }
}