import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { listAdminsUseCase } from '../../../src/usecases';

describe('ListUsersAccessUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should list users access', async () => {
        const users = await listAdminsUseCase();
        expect(users).toBeDefined();
        expect(users.items.length).toBe(2);
        expect(users.items[0]?.prenom).toBe('Ahmed');
        expect(users.items[0]?.nom).toBe('BEN SALAH');
        expect(users.items[0]?.email).toBe('ahmed@squaad.io');
        expect(users.items[0]?.role).toBe('admin.super');

        expect(users.items[1]?.prenom).toBe('Sylvin');
        expect(users.items[1]?.nom).toBe('Moreau');
        expect(users.items[1]?.email).toBe('sylvain@squaad.io');
        expect(users.items[1]?.role).toBe('admin.editor');
    });
});