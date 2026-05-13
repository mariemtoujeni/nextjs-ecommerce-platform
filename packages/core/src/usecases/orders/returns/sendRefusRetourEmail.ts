import { ReturnPresenter, UserRoles } from "../../../models";
import { BodyResponse, ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const sendRefusRetourEmailUseCase = async (retour: ReturnPresenter): Promise<BodyResponse> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const emailService = await getInjection("IEmailService");
    const emailResponse = await emailService.sendRefusRetourEmail(retour);
    return emailResponse;
};