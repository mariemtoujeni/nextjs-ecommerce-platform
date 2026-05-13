import { describe, it, expect } from "vitest";
import { listCartItemsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listCustomerCartUseCase", () => {

  it("should return customer cart", async () => {
    await signInTestUser(TestUser.CUSTOMER);
    const cart = await listCartItemsUseCase();
    expect(cart).toBeDefined();
  });
});
