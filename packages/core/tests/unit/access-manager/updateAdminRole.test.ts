import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { updateAdminRoleUseCase } from '../../../src/usecases';

describe('UpdateAdminRoleUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should update admin role', async () => {
        const newAdmin = {
            id: "1",
            prenom: 'Ahmed',
            nom: 'BEN SALAH',
            email: 'ahmed@squaad.io',
            role: 'admin.editor',
            created_at: new Date().toISOString()
        };

        const updatedAdmin = await updateAdminRoleUseCase({
            id: newAdmin.id,
            prenom: newAdmin.prenom,
            nom: newAdmin.nom,
            email: newAdmin.email,
            role: newAdmin.role as 'admin.editor' | 'admin.super'
        });
        expect(updatedAdmin).toBeDefined();
        expect(updatedAdmin.id).toBe(newAdmin.id);
        expect(updatedAdmin.role).toBe(newAdmin.role);
    });
});
