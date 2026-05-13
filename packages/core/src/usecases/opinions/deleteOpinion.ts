import { getInjection } from "../../types";
import { Opinion } from "../../models";

export const deleteOpinionUseCase = async (id: number): Promise<void> => {
    const opinionRepository = await getInjection('IOpinionRepository');

    await opinionRepository.deleteOpinion(id);
};