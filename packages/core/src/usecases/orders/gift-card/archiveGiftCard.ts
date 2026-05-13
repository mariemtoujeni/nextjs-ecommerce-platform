import { GiftCard, GiftCardInput, UserRoles } from "../../../models";
import { ErrorCodes, ReturnOne, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";


export const archiveGiftCardUseCase = async (giftCardToUpdate: GiftCardInput): Promise<GiftCard> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const giftCardRepository = await getInjection('IGiftCardRepository');
    const giftCard = await giftCardRepository.update({
        ...giftCardToUpdate,
        cancelled: 1
    });

    return giftCard;
}