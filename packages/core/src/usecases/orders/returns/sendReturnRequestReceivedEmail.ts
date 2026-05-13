import { ReturnPresenter, UserRoles } from "../../../models";
import { BodyResponse, ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const sendReturnRequestReceivedEmailUseCase = async (retour: ReturnPresenter, bon_retour: string): Promise<BodyResponse> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const emailService = await getInjection("IEmailService");
    const emailResponse = await emailService.sendReturnRequestReceivedEmail(retour, bon_retour);

    return emailResponse;
};