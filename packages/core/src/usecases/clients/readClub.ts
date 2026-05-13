import { Club, clubOptionsSchema } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";


export const getClubsUseCase = async (options?: string): Promise<ReturnAll<Club>> => {

    const validatedOptions = clubOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const clientRepository = await getInjection('IClientRepository');

    const Clubs = await clientRepository.readClub(validatedOptions.data);
    
    return Clubs;
}