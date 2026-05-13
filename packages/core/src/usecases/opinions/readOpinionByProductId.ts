import { getInjection, NotFoundError } from "../../types";
import { Opinion } from "../../models";

export const readOpinionByProductIdUseCase = async (productId: number): Promise<Opinion[]> => {
    const opinionRepository = await getInjection('IOpinionRepository');

    const opinions = await opinionRepository.readOpinionByProductId(productId);
    // if (opinions.length === 0) {
    //     throw new NotFoundError("review not found");
    // }
    return opinions;
}
// This function retrieves all opinions associated with a specific product ID from the opinion repository.