import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addToCartUseCase } from "@repo/core/usecases";
import { CartActionType } from "@repo/core/models";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types";

describe("addToCartUseCase", () => {
  beforeEach(async () => { await setup(); });
  afterEach(async () => { await teardown(); });

  it("should increment quantity", async () => {
    const authService = await getInjection('IAuthenticationService');
    await authService.signIn("marie.martin@email.com", "test");

    await addToCartUseCase({
      userId: "user2", modelId: 3, type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    const result = await addToCartUseCase({
      userId: "user2",
      modelId: 3,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });
    expect(result.outOfStock).toBe(false);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.quantity).toBe(3);

    authService.signOut();
  });

  it("should decrement quantity", async () => {
    const authService = await getInjection('IAuthenticationService');
    await authService.signIn("marie.martin@email.com", "test");

    await addToCartUseCase({
      userId: "user2", modelId: 3, type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });
    await addToCartUseCase({
      userId: "user2", modelId: 3, type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    const result = await addToCartUseCase({
      userId: "user2",
      modelId: 3,
      type: CartActionType.DECREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });
    expect(result.outOfStock).toBe(false);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.quantity).toBe(2);

    authService.signOut();
  });

  it("should remove item when quantity reaches zero", async () => {
    const authService = await getInjection('IAuthenticationService');
    await authService.signIn("marie.martin@email.com", "test");

    const result = await addToCartUseCase({
      userId: "user2",
      modelId: 3,
      type: CartActionType.DECREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });
    expect(result.outOfStock).toBe(false);
    expect(result.items).toHaveLength(0);
    authService.signOut();

  });
  

});
