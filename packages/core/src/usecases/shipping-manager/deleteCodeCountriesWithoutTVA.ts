import { Country, UserRoles } from "../../models";
import { getInjection, ReturnAll } from "../../types";
import { ErrorCodes, UnauthorizedError } from "../../types/error";

export const deleteCodeCountriesWithoutTVAUseCase = async (code: string): Promise<ReturnAll<Country>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const shipmentConf = await getInjection("IShippingManagerRepository");
    await shipmentConf.deleteCodeCountriesWithoutTVA(code);

    const countries = await shipmentConf.readAllCountries();
    return countries;
}