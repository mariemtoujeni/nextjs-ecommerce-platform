import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getClientDiscountsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection, UnauthorizedError } from "@repo/core/types";

// Tests unitaires pour la récupération des réductions du client connecté

describe.skip('getClientDiscountsUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
/*
    it('doit retourner les réductions du client connecté, triées du plus récent au plus ancien', async () => {
        // On connecte l'utilisateur ayant l'id "1" (2 réductions dans le setup)
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test");
        const discounts = await getClientDiscountsUseCase();
        expect(discounts).toHaveLength(2);
        // Vérifie que la réduction la plus récente est en premier
        expect(discounts[0]?.createdAt.getTime()).toBeGreaterThan(discounts[1]?.createdAt.getTime());
        // Vérifie les codes pour s'assurer de l'ordre
        expect(discounts[0]?.code).toBe("WELCOME10");
        expect(discounts[1]?.code).toBe("FIDELITE5");
    });

    it('doit lever une erreur si le client n\'est pas connecté', async () => {
        // On s'assure qu'aucun utilisateur n'est connecté
        const authService = await getInjection('IAuthenticationService');
        await authService.signOut();
        await expect(getClientDiscountsUseCase()).rejects.toThrow(UnauthorizedError);
    });

    it('doit retourner un tableau vide si le client n\'a aucune réduction', async () => {
        // On connecte un utilisateur existant sans réduction (ex: id_user "3")
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("contact@entreprise.fr", "test");
        const discounts = await getClientDiscountsUseCase();
        expect(discounts).toHaveLength(0);
    });
    */
}); 