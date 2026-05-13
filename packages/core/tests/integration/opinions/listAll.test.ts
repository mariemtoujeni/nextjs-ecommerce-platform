import { describe, test, expect, beforeEach, afterEach, it } from 'vitest';
import { listAllOpinionsUseCase } from "../../../src/usecases";
import { signInTestUser, TestUser } from '../utils';

describe('listAllOpinions - Integration', () => {
  it('should return all products', async () => {
        await signInTestUser(TestUser.ADMIN);

        const products = await listAllOpinionsUseCase();
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.total).toBeGreaterThan(2);
        expect(products.count).toBeGreaterThan(2);
    })
});
