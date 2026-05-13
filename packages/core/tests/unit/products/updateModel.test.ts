import { updateModel } from "../../../src/usecases/products/updateModel";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ModelUpdate } from "../../../src/models/Model";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";

import { setup, teardown } from "./_Setup";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";


describe("updateModel", () => {
    beforeEach(setup)
    afterEach(teardown)

    const modelId = 1;
    const update: ModelUpdate = {
        weight: 100,
        priceWithoutVat: 100,
        priceWithVat: 100,
        published: false,
        minStock: 100,
        purchasePrice: 100,
        barcode: "1234567890",
        supplierReference: "",
        manufacturerReference: ""
    }

    it("should update a model", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await updateModel(modelId, update);

        const model = SharedMemory.models.find(m => m.id === modelId);
        expect(model?.weight).toBe(update.weight);
        expect(model?.priceWithoutVat).toBe(update.priceWithoutVat);
        expect(model?.priceWithVat).toBe(update.priceWithVat);
        expect(model?.published).toBe(update.published);

        await authService.signOut();
    })

    it("should not update a model if the user is not authenticated", async () => {
        await expect(updateModel(modelId, update)).rejects.toThrow(UnauthorizedError);
    })
})