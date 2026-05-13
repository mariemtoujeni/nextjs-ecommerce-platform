import { expect, describe, it } from "vitest"
import { Client } from "../../../src/models"
import { listAllClientsUseCase } from "../../../src/usecases"
import { signInTestUser, TestUser } from "../utils"

describe('listAllClients', () => {
    
    it('should return 50 clients', async () => {
        await signInTestUser(TestUser.ADMIN);

        let clients = await listAllClientsUseCase();
        expect(clients.items.length).toBeGreaterThan(0);
        expect(clients.total).toBeGreaterThan(10000);
        expect(clients.count).toEqual(clients.items.length);
        expect(clients.count).toEqual(50);

        expect(clients.items[0]?.clientNumber).toBeGreaterThan(clients.items[1]?.clientNumber ?? 0);

        clients = await listAllClientsUseCase({sort: "asc"});
        expect(clients.items[0]?.clientNumber).toBeLessThan(clients.items[1]?.clientNumber ?? 0);

        const item = clients.items[0] as Client;
        expect(item.clubId).toBeDefined();
        expect(item.birthDate).toBeDefined();
        expect(item.clubMemberId).toBeDefined();
        expect(item.credit).toBeDefined();
        expect(item.email).toBeDefined();
        expect(item.fidelityPoints).toBeDefined();
        expect(item.firstName).toBeDefined();
        expect(item.lastName).toBeDefined();
        expect(item.mobilePhone).toBeDefined();
        expect(item.newsLetter).toBeDefined();
        expect(item.phone).toBeDefined();
        expect(item.workPhone).toBeDefined();
        expect(item.lang).toBeDefined();
        expect(item.partnerOffer).toBeDefined();
        expect(item.siteOffer).toBeDefined();
        expect(item.type).toBeDefined();
    })
})