import { getInjection } from "@repo/core/types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setup, teardown } from "./_Setup";
import { bestAutoReduction } from "@repo/core/usecases";
import { DiscountState, DiscountTypeValue, ProductStatus, ReductionValueType, TypeDiscount } from "@repo/core/models";
import { getDiscountByIdUseCase, updateDiscountUseCase } from "@repo/core/usecases"; 
import { SharedMemory } from "@repo/core/adapters/mock";

const baseProduct = {
  id: 1001,
  categoryId: 201,
  category: { id: 201, name: "", active: 0, order: 0 },
  subCategoryId: 301,
  subCategory: { id: 301, name: "", active: 0, order: 0 },
  brandId: 401,
  brand: { id: 401, name: "" },
  isPackage: false,
  price: 0,
  vatRate: 0,
  isGiftCard: false,
  giftCardDuration: 0,
  status: ProductStatus.DRAFT,
  customization: false,
  customizations: undefined,
  minStock: 0,
  createdAt: "",
  updatedAt: "",
  descriptions: [],
  images: [],
  stores: undefined,
  productAttributes: undefined,
  modeles: undefined,
  modelAttributs: undefined,
  collections: undefined,
  weight: 0,
};

const baseModel = {
  id: 101,
  productId: 1001,
  weight: 0,
  priceWithoutVat: 100,
  priceWithVat: 0,
  published: false,
  minStock: 0,
  purchasePrice: 0,
  barcode: "",
  supplierReference: "",
  manufacturerReference: "",
  product: baseProduct,
  attributValues: [],
};
const lowPriceModel = {
  ...baseModel,
  id: 103,
  productId: 1003,
  priceWithoutVat: 50,
  product: { ...baseProduct, id: 1003, categoryId: 789 },
  };
const modelCat202 = {
    ...baseModel,
    id: 102,
    productId: 1002,
    product: { ...baseProduct, id: 1002, categoryId: 202 },
  };

const activateOnly = async (ids: number[]) => {
  const allIds = SharedMemory.discounts.map(d => d.id);
  for (const id of allIds) {
    const discount = await getDiscountByIdUseCase(id);
    const { discountLines, ...discountWithoutLines } = discount;
    await updateDiscountUseCase({ ...discountWithoutLines, etat: ids.includes(id) ? DiscountState.ACTIVE : DiscountState.INACTIVE });
  }
};

describe("bestAutoReduction", () => {
  beforeEach(async () => {
    await setup();

    SharedMemory.products.push({ ...baseProduct });
    SharedMemory.models.push({ ...baseModel });
    SharedMemory.model_attribut_valeurs.push(...baseModel.attributValues);

    SharedMemory.products.push({ ...modelCat202.product });
    SharedMemory.models.push({ ...modelCat202 });
    SharedMemory.model_attribut_valeurs.push(...modelCat202.attributValues);

    SharedMemory.products.push({ ...lowPriceModel.product });
    SharedMemory.models.push({ ...lowPriceModel });
    SharedMemory.model_attribut_valeurs.push(...lowPriceModel.attributValues);
  });

  afterEach(async () => {
    await teardown();
  });

  it("applies 60% off for category 201", async () => {

    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([1]);

    const result = await bestAutoReduction(baseModel.id, 2);
    expect(result).toBeDefined();
    expect(result?.type_valeur_reduction).toBe(ReductionValueType.PERCENTAGE);
    expect(result?.valeur_reduction).toBe(100 * 2 * 0.6);
  });

  it("applies 15€ fixed discount for category 202", async () => {

    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([2]);

    const result = await bestAutoReduction(modelCat202.id, 2);
    expect(result).toBeDefined();
    expect(result?.type_valeur_reduction).toBe(ReductionValueType.MONTANT);
    expect(result?.valeur_reduction).toBe(15 * 2);
  });

  it("returns null if minimum purchase condition is not met", async () => {
    await activateOnly([3]); // Cheque Cadeau

    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");

    const result = await bestAutoReduction(lowPriceModel.id, 1, "CADEAUX25");
    expect(result).toBeUndefined();
  });

  it("applies 50% club discount for product 1001", async () => {

    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([8]);
    const qte = 2;
    const result = await bestAutoReduction(baseModel.id, qte);
    expect(result?.type_reduction).toBe(TypeDiscount.CLUB);
    expect(result?.type_valeur_reduction).toBe(ReductionValueType.PERCENTAGE);
    expect(result?.valeur_reduction).toBe(100 * 2 * 0.5);
  });

  it("returns best discount among multiple (60% wins over 50%)", async () => {

    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([8, 1]); // 50% club + 60% category
    const qte = 2;
    const result = await bestAutoReduction(baseModel.id, qte);
    expect(result?.type_reduction).toBe(TypeDiscount.CAMPAGNE);
    expect(result?.type_valeur_reduction).toBe(ReductionValueType.PERCENTAGE);
    expect(result?.valeur_reduction).toBe(100 * 2 * 0.6);
  });
});
