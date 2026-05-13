import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSupplierUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "../../../src/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupplierInput } from "../../../src/models";
import { BadRequestError } from "../../../src/types/error";


describe("createSupplierUseCase", () => {
    let supabase: SupabaseClient;
    let supplierId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        const { error } = await supabase.from("fournisseurs").delete().eq("id", supplierId);
        if (error) {
            console.error("CREATE SUPPLIER -> Error deleting supplier -> delete supplier: ", error, "| supplierId: ", supplierId);
        }
    });
    
    it("should create a supplier", async () => {
        const supplierInput: SupplierInput = {
            name: "Test automatique Supplier 2",
            address: "1 Rue de Test",
            zipCode: "75001",
            city: "Paris",
            country: "France",
            phone: "0123456789",
            email: "test@test.com"
        };
        const supplier = await createSupplierUseCase(supplierInput);
        supplierId = supplier.id;
        expect(supplier).toBeDefined();
        expect(supplier.id).toBeDefined();
        expect(supplier.name).toBe("Test automatique Supplier 2");
    });

    it("should throw an error if the supplier is not valid", async () => {
        const supplierInput: SupplierInput = {
            name: "",
            address: "1 Rue de Test",
            zipCode: "75001",
            city: "Paris",
            country: "France",
        };
        await expect(createSupplierUseCase(supplierInput)).rejects.toThrow(BadRequestError);
    });
});