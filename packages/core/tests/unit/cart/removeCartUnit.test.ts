import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteCartUnitUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";


describe("Delete cart unit", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should delete a cart unit and update stock for signed-in user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test"); 

    const cartRepository = await getInjection("ICartRepository");
    const cartBefore = await cartRepository.getCustomerCart("user1");
    expect(cartBefore.some(c => c.modelId === 1)).toBe(true);

    const stockBefore = await cartRepository.getStockByModelId(1);
    expect(stockBefore).toBeDefined();

    await deleteCartUnitUseCase(1); 

    const cartAfter = await cartRepository.getCustomerCart("user1");
    expect(cartAfter.some(c => c.modelId === 1)).toBe(false);

    const stockAfter = await cartRepository.getStockByModelId(1);
    expect(stockAfter.disponible).toBe(stockBefore.disponible + 2); 
    expect(stockAfter.indisponible).toBe(stockBefore.indisponible - 2);

    await authService.signOut();
  });

  it("should do nothing if cart unit does not exist", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test");

    await deleteCartUnitUseCase(999); 

    const cart = await (await getInjection("ICartRepository")).getCustomerCart("user1");
    expect(cart.length).toBeGreaterThan(0);

    await authService.signOut();
  });

  it("should throw UnauthorizedError if no user is signed in", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signOut();

    await expect(deleteCartUnitUseCase(1)).rejects.toThrow(UnauthorizedError);
  });
});
