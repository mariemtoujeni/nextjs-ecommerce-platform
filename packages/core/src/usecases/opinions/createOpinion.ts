import { getInjection } from "../../types";
import { Opinion } from "../../models";

export const createOpinionUseCase = async (opinion:Opinion): Promise<Opinion> =>{
    const opinionRepository = await getInjection('IOpinionRepository');

    const createOpinion = await opinionRepository.createOpinion(opinion)
    return createOpinion;
}