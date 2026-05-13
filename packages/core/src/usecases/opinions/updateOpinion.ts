import { Opinion } from "../../models";
import { getInjection } from "../../types";

export const updateOpinionUseCase = async (opinion: Opinion): Promise<Opinion> => {
    const opinionRepository = await getInjection('IOpinionRepository');

    const updatedOpinion = await opinionRepository.updateOpinion(opinion);
    return updatedOpinion;
};