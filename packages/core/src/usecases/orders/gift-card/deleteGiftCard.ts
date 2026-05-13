import { GiftCard, GiftCardInput, UserRoles } from "../../../models";
import { ErrorCodes, ReturnOne, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const deleteGiftCardUseCase = async (giftCardId: number): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const giftCardRepository = await getInjection('IGiftCardRepository');
    await giftCardRepository.delete(giftCardId);
    return;
}