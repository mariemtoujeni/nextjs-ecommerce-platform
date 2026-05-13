import { CreditNote, CreditNoteInput, CreditNoteSchema } from "../../../models";
import { BadRequestError, ErrorCodes, ReturnOne, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const createCreditNoteUseCase = async (creditNoteInput: CreditNoteInput): Promise<ReturnOne<CreditNote>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }

    try {
        // validate creditNoteInput with zod
        const validatedCreditNoteInput = CreditNoteSchema.parse(creditNoteInput);
        
        const creditNoteRepository = await getInjection("ICreditNoteRepository");
        const creditNote = await creditNoteRepository.create(validatedCreditNoteInput);

        return {
            item: creditNote.item,
            error: undefined
        };
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw new BadRequestError(error.message);
        }
        throw error;
    }
};