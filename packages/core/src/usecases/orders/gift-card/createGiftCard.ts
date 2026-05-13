import { GiftCard, GiftCardInput, gitCardSchema, UserRoles } from "../../../models";
import { ErrorCodes, ReturnOne } from "../../../types";
import { UnauthorizedError, BadRequestError } from "../../../types/error";
import { getInjection } from "../../../types";

export const createGiftCardUseCase = async (giftCard: GiftCardInput): Promise<ReturnOne<GiftCard>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const validatedGiftCard = gitCardSchema.safeParse(giftCard);
    if (!validatedGiftCard.success) {
        throw new BadRequestError(validatedGiftCard.error.message);
    }
    
    const giftCardRepository = await getInjection('IGiftCardRepository');
    const newGiftCard = await giftCardRepository.create(giftCard);

    const clientRepository = await getInjection('IClientRepository');
    const client = await clientRepository.readByClientNumber(validatedGiftCard.data.clientId);
    
    const emailService = await getInjection("IEmailService");
    const emailResponse = await emailService.sendGiftCardEmail({
        ...newGiftCard,
        client,
        usedBy: client
    });
    if (!emailResponse.success) {
        throw new BadRequestError(emailResponse.message);
    }

    return {
        item: newGiftCard,
    };
}