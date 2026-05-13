import { SignUpRequestWithoutPassword, signUpSchema } from "../../models";
import { BadRequestError, generateSecurePassword, getInjection } from "../../types";
import { UserRoles } from "../../models/User";
import { UnauthorizedError, ErrorCodes } from "../../types/error";


export const createUserUseCase = async (user: SignUpRequestWithoutPassword): Promise<number> => {

    const authService = await getInjection("IAuthenticationService");
    const userRequester = await authService.getUser();

    if (!userRequester) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    userRequester.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const generatedPassword = generateSecurePassword(8);

    //on doit gérer le mot de pass ici peut etre envoyer par email 

    const userWithPassword = { ...user, password: generatedPassword };

    const validatedUser = signUpSchema.safeParse(userWithPassword);

    if(!validatedUser.success) {
        throw new BadRequestError("Invalid options");
    }

    const userRepository = await getInjection("IUserRepository");

    const clientNumber = await userRepository.createUserByAdmin(validatedUser.data);

    return clientNumber.numero_client;
};
