// Usecase pour récupérer la liste des avoirs du client connecté, triés du plus récent au plus ancien
import { CreditNote, creditNote } from "../../models";
import { UnauthorizedError, getInjection } from "../../types";

export const getClientCreditNotesUseCase = async (): Promise<CreditNote[]> => {
    const creditNoteRepository = await getInjection('ICreditNoteRepository');
    const clientRepository = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    // On récupère le client à partir de l'id utilisateur
    const client = await clientRepository.read(user.id);
    // On récupère les avoirs du client
    const creditNotes = await creditNoteRepository.read(client.clientNumber);
    // Tri décroissant par date_creation
    return creditNotes.sort((a: CreditNote, b: CreditNote) => b.createdAt.getTime() - a.createdAt.getTime());
} 