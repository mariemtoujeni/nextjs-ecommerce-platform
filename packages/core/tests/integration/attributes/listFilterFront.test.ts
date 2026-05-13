import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listFilterAttributesUseCase } from "../../../src/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listFilterFront", () => {

    beforeAll(async () => {
        await signInTestUser(TestUser.CUSTOMER);
    });

    afterAll(async () => {
    });

    it("should return the filter attributes", async () => {
        const filterAttributes = await listFilterAttributesUseCase({
          store: "MAILLOT & COMBI",
          category: "Femme",
          sousCategory: "Plage",
          filterAttributeInput: []
        });
        expect(filterAttributes).toBeDefined();
        expect(filterAttributes.length).toBeGreaterThan(0);
    });

    it("should return the filter attributes with filterAttributeInput", async () => {
        const filterAttributes = await listFilterAttributesUseCase({
            store: "MAILLOT & COMBI",
            category: "Femme",
            sousCategory: "Plage",
            filterAttributeInput: [
                {
                    id_attribute: 0,
                    attribute_value_ids: [9],
                    attribute_value: ["CRAZYSWIM"],
                    type: "brand"
                }
            ]
        });
        expect(filterAttributes).toBeDefined();
        expect(filterAttributes.length).toBeGreaterThan(0);
        const brandFilterAttributes = filterAttributes.find(filter => filter.type === "brand");
        expect(brandFilterAttributes?.filters.length).toBe(1);
        expect(brandFilterAttributes?.filters[0]?.nom).toBe("CRAZYSWIM");
    });
});
