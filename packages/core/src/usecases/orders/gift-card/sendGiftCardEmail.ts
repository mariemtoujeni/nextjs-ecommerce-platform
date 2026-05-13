import { GiftCardPresenter, UserRoles } from "../../../models";
import { BodyResponse, ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const sendGiftCardEmailUseCase = async (giftCard: GiftCardPresenter): Promise<BodyResponse> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const emailService = await getInjection("IEmailService");
    const emailResponse = await emailService.sendGiftCardEmail(giftCard);
    return emailResponse;
};