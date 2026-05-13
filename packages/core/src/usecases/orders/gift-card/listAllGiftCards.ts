import { GiftCardFilterInput, GiftCardPresenter, UserRoles } from "../../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const listAllGiftCardsUseCase = async (options?: GiftCardFilterInput): Promise<ReturnAll<GiftCardPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const giftCardRepository = await getInjection('IGiftCardRepository');
    const defaultOptions = {
        limit: 50,
        offset: 0,
        sort: 'desc' as const,
        search: '',
        filters: []
    };
    const mergedOptions = {
        ...defaultOptions,
        ...options
    };
    const giftCards = await giftCardRepository.listAll({
        limit: mergedOptions.limit ?? defaultOptions.limit,
        offset: mergedOptions.offset ?? defaultOptions.offset,
        sort: mergedOptions.sort ?? defaultOptions.sort,
        search: mergedOptions.search ?? defaultOptions.search,
        filters: mergedOptions.filters ?? defaultOptions.filters
    });
    return giftCards;
}