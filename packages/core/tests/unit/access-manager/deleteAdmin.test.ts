import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { deleteAdminUseCase, listAdminsUseCase } from '../../../src/usecases';

describe('DeleteAdminUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should delete admin', async () => {
        const id = "1";
        const email = 'ahmed@squaad.io';
        await deleteAdminUseCase(id, email);

        const users = await listAdminsUseCase();
        expect(users).toBeDefined();
        expect(users.items.length).toBe(1);
        expect(users.items[0]?.prenom).toBe('Sylvin');
        expect(users.items[0]?.nom).toBe('Moreau');        
    });
});
        
