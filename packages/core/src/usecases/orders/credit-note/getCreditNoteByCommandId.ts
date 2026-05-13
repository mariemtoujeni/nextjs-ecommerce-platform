import { CreditNote } from "../../../models";
import { ErrorCodes, NotFoundError, ReturnOne, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";


export const getCreditNoteByCommandIdUseCase = async (orderId: number): Promise<ReturnOne<CreditNote>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }

    const creditNoteRepository = await getInjection("ICreditNoteRepository");
    const creditNote = await creditNoteRepository.readAll({
        orderNumbers: [orderId],
        options: {
            limit: 1,
            offset: 0,
        }
    });

    if (creditNote.items.length === 0) {
        throw new NotFoundError("Aucun avoir trouvé pour cette commande");
    }

    return {
        item: creditNote.items[0] as CreditNote,
        error: undefined
    };
};
