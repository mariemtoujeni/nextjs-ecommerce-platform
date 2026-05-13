import { getInjection } from "../../types";

export const readProductOpinionUseCase = async (id: number): Promise<number | null> => {
    const opinionRepository = await getInjection('IOpinionRepository');

    const opinion = await opinionRepository.readProductOpinion(id)

    return opinion;
};