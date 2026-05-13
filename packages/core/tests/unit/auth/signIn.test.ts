import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { signInUseCase } from '@repo/core/usecases';
import { UnauthorizedError } from '@repo/core/types';

describe('SignInUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should sign in a user', async () => {
        const admin = await signInUseCase({ email: 'admin@test.com', password: 'password' });
        expect(admin).toBeDefined();

        const user = await signInUseCase({ email: 'user@test.com', password: 'password' });
        expect(user).toBeDefined();
    });

    it('Should sign in only if admin', async () => {
        await expect(signInUseCase({ email: 'user@test.com', password: 'password', checkAdmin: true })).rejects.toThrow(UnauthorizedError);

        await expect(signInUseCase({ email: 'admin@test.com', password: 'password', checkAdmin: true })).resolves.not.toThrow(UnauthorizedError);
    });
});