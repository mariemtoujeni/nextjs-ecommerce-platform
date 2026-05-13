import { Settings, UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const updateConfsUseCase = async (confs: Settings): Promise<Settings> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const generalCOnf = await getInjection("IGeneralConfigurationsRepository");
    const updatedConfs = await generalCOnf.update(confs);

    return updatedConfs;
}