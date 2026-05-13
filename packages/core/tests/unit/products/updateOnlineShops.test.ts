import { OnlineShop } from "../../../src/models/Product";
import { updateOnlineShops } from "../../../src/usecases/products/updateOnlineShops";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";


describe("updateOnlineShops", () => {
    const onlineShops = [OnlineShop.SWIMWEAR_DESTOCK, OnlineShop.CRAZYSWIM];
    const productId = 1;

    beforeEach(setup);
    afterEach(teardown);

    it("should update the online shops of a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        
        await updateOnlineShops(productId, onlineShops);

        const shops = SharedMemory.productOnlineShopes.filter(shop => shop.productId === productId);
        expect(shops.map(shop => shop.onlineShop)).toEqual(onlineShops);

        await authService.signOut();
    });

    it("should not update the online shops of a product if the user is not authenticated", async () => {
        await expect(updateOnlineShops(productId, onlineShops)).rejects.toThrow(UnauthorizedError);
    });
});