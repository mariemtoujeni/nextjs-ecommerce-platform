import { getInjection } from "../../types";
import { Opinion } from "../../models";

export const readOpinionByUserIdUseCase = async (userId: number): Promise<Opinion[]> => {
    const opinionRepository = await getInjection('IOpinionRepository');

    const opinions = await opinionRepository.readOpinionByUserId(userId);

    return opinions;
}
// This function retrieves all opinions associated with a specific user ID from the opinion repository.
// It uses the getInjection function to get an instance of the opinion repository and then calls the readOpinionByUserId method with the provided user ID.
// The result is an array of Opinion objects that belong to the specified user.