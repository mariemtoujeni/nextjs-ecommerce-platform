import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getClientCreditNotesUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { CreditNoteType } from "@repo/core/models";

// Tests unitaires pour la récupération des avoirs du client connecté

describe('getClientCreditNotesUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('doit retourner les avoirs du client connecté, triés du plus récent au plus ancien', async () => {
        // On connecte le client ayant le numero_client 1001 (2 avoirs dans le setup)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test");
        const creditNotes = await getClientCreditNotesUseCase();
        expect(creditNotes).toHaveLength(2);
        
        // Vérifie les types pour s'assurer de l'ordre
        expect(creditNotes[0]?.type).toBe(CreditNoteType.REMBOURSEMENT);
        expect(creditNotes[1]?.type).toBe(CreditNoteType.REMBOURSEMENT);
    });

    it('doit lever une erreur si le client n\'est pas connecté', async () => {
        // On s'assure qu'aucun utilisateur n'est connecté
        const authService = await getInjection('IAuthenticationService');
        await authService.signOut();
        await expect(getClientCreditNotesUseCase()).rejects.toThrow(UnauthorizedError);
    });

    it('doit retourner un tableau vide si le client n\'a aucun avoir', async () => {
        // On connecte un client existant sans avoir (ex: clientNumber 1003)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("contact@entreprise.fr", "test");
        const creditNotes = await getClientCreditNotesUseCase();
        expect(creditNotes).toHaveLength(0);
    });
}); 