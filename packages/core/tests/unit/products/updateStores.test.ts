import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { updateStoresUseCase } from "../../../src/usecases/products/updateStores";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";


describe("updateStores", () => {
    beforeEach(setup);
    afterEach(teardown);

    it("should update the stores of a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await updateStoresUseCase(1, [2, 3]);
        const storeRepository = await getInjection("IStoreRepository");
        const stores = await storeRepository.readByProductId(1);
        expect(stores).toEqual([{ id: 2, name: "Store 2", active: 1, order: 1 }, { id: 3, name: "Store 3", active: 1, order: 1 }]);

        await authService.signOut();
    })

    // it("should not update the stores of a product if the user is not authenticated", async () => {
    //     await expect(updateStoresUseCase(1, [2, 3])).rejects.toThrow(UnauthorizedError);
    // })
})