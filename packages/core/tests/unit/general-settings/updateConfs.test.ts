import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { updateConfsUseCase } from '../../../src/usecases';
import { getInjection } from '../../../src/types/di';

describe('UpdateConfsUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should update general configurations', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const confs = await updateConfsUseCase({
            duree_validite_avoir: 20,
            type_duree_validitee_avoir: 'JOUR',
            duree_validite_cheque_cadeau: 20,
            type_duree_validite_cheque_cadeau: 'MOIS',
            duree_validite_cashback: 20,
            type_duree_validite_cashback: 'MOIS',
            duree_validite_email_relance: 20,
            type_duree_validite_email_relance: 'JOUR',
        });
        
        expect(confs).toBeDefined();
        expect(confs.duree_validite_avoir).toBe(20);
        expect(confs.type_duree_validitee_avoir).toBe('JOUR');
        expect(confs.duree_validite_cheque_cadeau).toBe(20);
        expect(confs.type_duree_validite_cheque_cadeau).toBe('MOIS');
        expect(confs.duree_validite_cashback).toBe(20);
        expect(confs.type_duree_validite_cashback).toBe('MOIS');
        expect(confs.duree_validite_email_relance).toBe(20);
        expect(confs.type_duree_validite_email_relance).toBe('JOUR');
    });
});