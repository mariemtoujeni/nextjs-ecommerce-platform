import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { createAdminRoleUseCase, listAdminsUseCase } from '../../../src/usecases';
import { NewAdmin } from '../../../src/models';

describe('CreateAdminRoleUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should create admin role', async () => {
        // const newAdmin: NewAdmin = {
        //     prenom: 'Julien',
        //     nom: 'BELLIARD',
        //     email: 'julien@squaad.io',
        //     role: 'admin.super'
        // } as NewAdmin;

        // const createdAdmin = await createAdminRoleUseCase(newAdmin);
        
        // const users = await listAdminsUseCase();
        // expect(users).toBeDefined();
        // expect(users.length).toBe(3);
        // expect(users[2].prenom).toBe('Julien');
        // expect(users[2].nom).toBe('BELLIARD');
        // expect(users[2].email).toBe('julien@squaad.io');
    });
});

