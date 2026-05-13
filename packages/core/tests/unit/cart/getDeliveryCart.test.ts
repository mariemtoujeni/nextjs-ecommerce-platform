import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDeliveryCartUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";

describe("Read user delivery cart", () => {
    beforeEach(setup);
    afterEach(teardown);

    it("should return a delivery cart", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("jean.dupont@email.com", "test");
        
        const deliveryCart = await getDeliveryCartUseCase();
        expect(deliveryCart).toBeDefined();
        expect(deliveryCart.userId).toBe('user1');
        expect(deliveryCart.prix).toBe(11);
        expect(deliveryCart.weight).toBe(1.3);

        await authService.signOut();
    });

    it("should create a delivery cart and return it", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("marie.martin@email.com", "test");
        
        const deliveryCart = await getDeliveryCartUseCase();
        expect(deliveryCart).toBeDefined();
        expect(deliveryCart.userId).toBe('user2');
        
        await authService.signOut();
    });

    it("should throw UnauthorizedError if no user is signed in", async () => {
        await expect(getDeliveryCartUseCase()).rejects.toThrow(UnauthorizedError);
    });

    it("should throw if user has no default address", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("pierre.dubois@email.com", "test");

        await expect(getDeliveryCartUseCase()).rejects.toThrow("No default address found");

        await authService.signOut();
    });

    it("should update delivery (weight and delivery price) cart when weight has changed", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("user4@email.com", "test");

        const deliveryCart = await getDeliveryCartUseCase();
        expect(deliveryCart.weight).toBeGreaterThan(0);
        expect(deliveryCart.weight).toBe(2.4);
        expect(deliveryCart.prix).toBe(11);

        await authService.signOut();
    });

});
