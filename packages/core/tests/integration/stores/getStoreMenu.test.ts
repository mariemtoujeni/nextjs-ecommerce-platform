import { getStoreMenu } from "../../../src/usecases/stores/getStoreMenu";
import { describe, it, expect } from "vitest";
import { signInAnonymous, signOutTestUser } from "../utils";

describe('getStoreMenu', () => {
  it('should return the store menu', async () => {
    await signInAnonymous();
    
    const storeMenu = await getStoreMenu('fr');
    expect(storeMenu).toBeDefined();
    expect(storeMenu.length).toBeGreaterThan(0);

    await signOutTestUser();
  });
});