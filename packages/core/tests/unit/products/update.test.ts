import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { updateProductUseCase } from "../../../src/usecases/products/update";
import { setup, teardown } from "./_Setup";
import { Product, ProductState, ProductStatus, ProductUpdate } from "../../../src/models/Product";
import { getInjection } from "../../../src/types/di";
import { NotFoundError, UnauthorizedError } from "../../../src/types/error";

describe("updateProductUseCase", () => {

    const productUpdate: ProductUpdate = {
        categoryId: 1,
        subCategoryId: 1,
        brandId: 1,
        isPackage: false,
        price: 100,
        vatRate: 20,
        isGiftCard: true,
        giftCardDuration: 1,
        status: ProductStatus.DRAFT,
        customization: true,
        minStock: 10,
        weight: 100,
        buyPriceWithoutVat: 100,
        supplierId: 1,
        manufacturerReference: "1234567890",
        comment: "test",
        state: ProductState.NORMAL,
    }

    beforeEach(async () => {
        setup();
    });
    afterEach(() => {
        teardown();
    });

    it("should update a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("admin@admin.com", "admin");

        await updateProductUseCase(1, productUpdate);
        const product = await (await getInjection("IProductRepository")).readAdmin(1);
        // for (const key in productUpdate) {
        //     expect(product[key as keyof Product]).toBe(productUpdate[key as keyof ProductUpdate]);
        // }
    
        await authService.signOut();
    });

    // it("should not update a product if the user is not authenticated", async () => {
    //     await expect(updateProductUseCase(1, productUpdate)).rejects.toThrow(UnauthorizedError);
    // });

    it("should not update a product if the product does not exist", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("admin@admin.com", "admin");
        await expect(updateProductUseCase(100, productUpdate)).rejects.toThrow(NotFoundError);
        await authService.signOut();
    });
});