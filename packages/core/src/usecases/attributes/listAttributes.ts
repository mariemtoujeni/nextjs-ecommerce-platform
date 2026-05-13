import { Attribut, UserRoles } from "../../models";
import { getInjection } from "../../types";
import { UnauthorizedError, ErrorCodes } from "../../types/error";


export const listAttributesUseCase = async (): Promise<Attribut[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const attribute = await getInjection("IAttributRepository");
    
    const attributes = await attribute.readAllAttributes();
    if (!attributes) {
        throw new Error("Attributes not found");
    }

    return attributes;
}