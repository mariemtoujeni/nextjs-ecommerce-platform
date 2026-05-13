import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { getConfsUseCase } from '../../../src/usecases';
import { getInjection } from '../../../src/types/di';

describe('GetConfsUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should get general configurations', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const confs = await getConfsUseCase();
        expect(confs).toBeDefined();
        expect(confs.duree_validite_avoir).toBe(10);
        expect(confs.type_duree_validitee_avoir).toBe('JOUR');
        expect(confs.duree_validite_cheque_cadeau).toBe(10);
        expect(confs.type_duree_validite_cheque_cadeau).toBe('MOIS');
        expect(confs.duree_validite_cashback).toBe(10);
        expect(confs.type_duree_validite_cashback).toBe('MOIS');
        expect(confs.duree_validite_email_relance).toBe(10);
        expect(confs.type_duree_validite_email_relance).toBe('JOUR');
    });
});