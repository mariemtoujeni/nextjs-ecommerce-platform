import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getClientReturnsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection, UnauthorizedError } from "@repo/core/types";

// Tests unitaires pour la récupération des retours du client connecté

describe.skip('getClientReturnsUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    /*
    it('doit retourner les retours du client connecté, triés du plus récent au plus ancien', async () => {
        // On connecte le client ayant le numero_client 1001 (2 commandes, donc 2 retours dans le setup)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test");
        const returns = await getClientReturnsUseCase();
        expect(returns).toHaveLength(2);
        // Vérifie que le retour le plus récent est en premier
        expect(returns[0].date_demande.getTime()).toBeGreaterThan(returns[1].date_demande.getTime());
        // Vérifie les types de retour pour s'assurer de l'ordre
        expect(returns[0].type_retour).toBe("RETOUR_PRODUIT");
        expect(returns[1].type_retour).toBe("RETOUR_TAILLE");
    });

    it('doit lever une erreur si le client n\'est pas connecté', async () => {
        // On s'assure qu'aucun utilisateur n'est connecté
        const authService = await getInjection('IAuthenticationService');
        await authService.signOut();
        await expect(getClientReturnsUseCase()).rejects.toThrow(UnauthorizedError);
    });

    it('doit retourner un tableau vide si le client n\'a aucun retour', async () => {
        // On connecte un client existant sans retour (ex: clientNumber 1003)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("contact@entreprise.fr", "test");
        const returns = await getClientReturnsUseCase();
        expect(returns).toHaveLength(0);
    });
    */
}); 