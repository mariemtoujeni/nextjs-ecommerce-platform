import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateClientInformationsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection, NotFoundError } from "@repo/core/types";
import { ClientType } from "../../../src/models";

describe.skip('updateClientInformations', () => {
    beforeEach(setup);
    afterEach(teardown);
/*
    it('should update client informations', async () => {
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test")

        const updatedClient = await updateClientInformationsUseCase({
            clientNumber: 1,
            homePhone: "0987654321",
            mobilePhone: "0698765432",
            workPhone: "0198765432",
            type: ClientType.CLIENT,
            lang: "fr",
            clubMemberId: 1,
            fidelityPoints: 100,
            siteOffer: true,
            createdAt: new Date("2024-02-15"),
            updatedAt: new Date("2024-02-15"),
            idClub: 4,
            clientNumber: 2,
            newsletter: true,
            credit: 200
        });
        
        expect(updatedClient.userId).toBe("1");
        expect(updatedClient.email).toBe("jean.dupuy@email.com");
        expect(updatedClient.firstName).toBe("Jean");
        expect(updatedClient.lastName).toBe("Dupuy");
        expect(updatedClient.phone).toBe("0987654321");
        expect(updatedClient.phoneMobile).toBe("0698765432");
        expect(updatedClient.phoneWork).toBe("0198765432");
        expect(updatedClient.birthDate).toStrictEqual(new Date("1988-11-30"));
        expect(updatedClient.type).toBe(ClientType.INDIVIDUAL);
        expect(updatedClient.lang).toBe("fr");
        expect(updatedClient.idClubMember).toBe(1);
        expect(updatedClient.fidelityPoints).toBe(100);
        expect(updatedClient.siteOffer).toBe(true);
        expect(updatedClient.createdAt).toStrictEqual(new Date("2024-02-15"));
        expect(updatedClient.updatedAt).toStrictEqual(new Date("2024-02-15"));
        expect(updatedClient.idClub).toBe(4);
        expect(updatedClient.clientNumber).toBe(2);
        expect(updatedClient.newsletter).toBe(true);
        expect(updatedClient.credit).toBe(200);
    })
    */
})