import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getClientOrdersUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection, UnauthorizedError } from "@repo/core/types";

// Tests unitaires pour la récupération des commandes du client connecté

describe.skip('getClientOrdersUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    /*
    it('doit retourner les commandes du client connecté, triées de la plus récente à la plus ancienne', async () => {
        // On connecte le client ayant le numero_client 1001 (2 commandes dans le setup)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test");
        const orders = await getClientOrdersUseCase();
        expect(orders).toHaveLength(2);
        // Vérifie que la commande la plus récente est en premier
        expect(orders[0].createdAt.getTime()).toBeGreaterThan(orders[1].createdAt.getTime());
        // Vérifie les montants pour s'assurer de l'ordre
        expect(orders[0].amount).toBe(75.00);
        expect(orders[1].amount).toBe(120.50);
    });

    it('doit lever une erreur si le client n\'est pas connecté', async () => {
        // On s'assure qu'aucun utilisateur n'est connecté
        const authService = await getInjection('IAuthenticationService');
        await authService.signOut();
        await expect(getClientOrdersUseCase()).rejects.toThrow(UnauthorizedError);
    });

    it('doit retourner un tableau vide si le client n\'a aucune commande', async () => {
        // On connecte un client existant sans commande (ex: clientNumber 1003)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("contact@entreprise.fr", "test");
        const orders = await getClientOrdersUseCase();
        expect(orders).toHaveLength(0);
    });
    */
}); 