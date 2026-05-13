import { getInjection } from "../../types";
import { Opinion } from "../../models";

export const readOpinionById = async (id: number): Promise<Opinion | null> => {
    const opinionRepository = await getInjection('IOpinionRepository');

    const opinion = await opinionRepository.readOpinionById(id);
    if (!opinion) {
        throw new Error(`Opinion with id ${id} not found`);
    }
    return opinion;
};