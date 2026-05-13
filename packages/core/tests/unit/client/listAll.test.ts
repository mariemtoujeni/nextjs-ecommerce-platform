import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllClientsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe('listAllClients', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all clients', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const clients = await listAllClientsUseCase();
        expect(clients.total).toBe(10);
        expect(clients.count).toBe(10);
        expect(clients.items).toHaveLength(10);
    })

    it('Should return only the last 2 clients', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const clients = await listAllClientsUseCase({
            limit: 2,
            offset: 0,
        });
        expect(clients.total).toBe(10);
        expect(clients.count).toBe(2);
        expect(clients.items).toHaveLength(2);

        expect(clients.items[0]?.clientNumber).toBeGreaterThan(clients.items[1]?.clientNumber ?? 0);
    })

    it('Should return only the first 2 clients', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        
        const clients = await listAllClientsUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(clients.total).toBe(10);
        expect(clients.count).toBe(2);
        expect(clients.items).toHaveLength(2);

        expect(clients.items[0]?.clientNumber).toBeLessThan(clients.items[1]?.clientNumber ?? 0);
    })

    it('Should return only the 2 clients at position 3 and 4', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        
        const clients = await listAllClientsUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(clients.total).toBe(10);
        expect(clients.count).toBe(2);
        expect(clients.items).toHaveLength(2);

        expect(clients.items[0]?.clientNumber).toBe(3);
        expect(clients.items[1]?.clientNumber).toBe(4);
    })
})