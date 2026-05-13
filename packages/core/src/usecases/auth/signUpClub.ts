import { getInjection } from "../../types";
import { SignUpClub, SignUpClubSchema } from "../../models";

export const signUpClubUseCase = async (user:SignUpClub): Promise<boolean> => {
    const validateClub = SignUpClubSchema.parse(user);
    const userRepository = await getInjection("IUserRepository");
    const success  = await userRepository.createClubUser(validateClub);
    return success ;
}