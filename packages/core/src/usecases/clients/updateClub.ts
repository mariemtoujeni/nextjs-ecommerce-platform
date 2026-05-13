import { Club } from "../../models";
import { getInjection } from "../../types";


export const updateClubUseCase = async (club: Club): Promise<Club> => {
    const clubRepository = await getInjection('IClientRepository');
    const updatedClub = await clubRepository.updateClub(club);
    return updatedClub;
}