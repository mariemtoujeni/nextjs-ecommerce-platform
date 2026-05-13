import { z } from "zod";
import { Brand, Category, Store, SubCategory } from "./Category";
import { Model, ModelWithProduct } from "./Model";
import { Supplier } from "./Supplier";
import { Collection } from "./Collection";
import { ModelProductDetail } from "./Checkout";


export const productOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
})

export type ProductFilterInput = z.input<typeof productOptionsSchema>;
export type ProductFilter = z.infer<typeof productOptionsSchema>;

export enum ProductFilterTypeAdmin {
    STORE = "STORE",
    CATEGORY = "CATEGORY",
    SUBCATEGORY = "SUBCATEGORY",
    BRAND = "BRAND",
    ATTRIBUTE = "ATTRIBUTE",
    SUPPLIER = "SUPPLIER",
    STATE = "STATE",
}

export enum ProductStatus {
    DRAFT = 'BROUILLON',
    VALIDATED = 'VALIDE',
    PUBLISHED = 'PUBLIE',
    DEACTIVATED = 'DESACTIVE',
    ARCHIVED = 'ARCHIVE'
}

export enum ProductState  {
    NORMAL = "NORMAL",
    NEW_COLLECTION = "NOUVELLE_COLLECTION",
    DISCONTINUED = "PLUS_FABRIQUE",
    RESTOCK = "REASSORT",
    OLD_COLLECTION = "ANCIENNE_COLLECTION",
    CLUB = "PRODUIT_CLUB",
    TRASH = "CORBEILLE"
}

export enum OnlineShop {
    NATAQUASHOP = 'NATAQUASHOP',
    CRAZYSWIM = 'CRAZYSWIM',
    SWIMWEAR_DESTOCK = 'SWIMWEAR',
}

export type ProductImage = {
    productId: number;
    url: string;
    attributeValueId: number;
    attribute?: ProductAttributeValues;
}

export type ProductDescription = {
    productId?: number;
    title: string;
    lang: string;
    description: string;
}

export type ProductAttributeValues = {
    id: number;
    name: string;
    attribute?: {
        name: string;
    };
}

export type ProductAttribute = {
    id: number;
    name: string;
    values: ProductAttributeValues[];
}
export type Customization = {
    id: number;
    description: string;
    price: number;
}

export type ModelWithAttributs = {
  id: number;
  price: number;
  stock: number;
  attributeValues: ProductAttributeValues[];
};

export const StockOptionsSchema = z.object({
  limit: z.number().optional().default(50),
  offset: z.number().optional().default(0),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional().default(''),
  filters: z.array(z.object({
    key: z.string(),
    values: z.union([z.array(z.string()), z.array(z.object({
      key: z.string(),
      values: z.array(z.string())
    }))]),
  })).optional(),
});

export type StockFilterInput = z.input<typeof StockOptionsSchema>;
export type StockFilter = z.infer<typeof StockOptionsSchema>;

export enum StockFilterType {
  STATUS = "STATUS",
  PUBLISHED = "PUBLISHED"
}

export const StockInputSchema = z.object({
  idModel: z.number(),
  locked: z.number().min(0).optional().default(0),
  indisponible: z.number().min(0).optional().default(0),
  disponible: z.number().optional().default(0),
  updatedAt: z.string().optional().default(new Date().toISOString()),
});

export type StockInput = z.infer<typeof StockInputSchema>;
export type Stock = {
  idModel: number;
  locked: number;
  disponible: number;
  indisponible: number;
  updatedAt: string;
}

export type StockPresenter = Stock & {
    model: ModelProductDetail;
    published: boolean;
}

export type Product = {
    id: number;
    categoryId: number;
    category: Category;
    subCategoryId: number;
    subCategory: SubCategory;
    brandId: number;
    brand: Brand;
    isPackage: boolean;
    price: number;
    vatRate: number;
    isGiftCard: boolean;
    giftCardDuration: number;
    status: ProductStatus;
    customization: boolean;   
    customizations?: Customization[];
    minStock: number;
    createdAt: string;
    updatedAt: string;
    descriptions: ProductDescription[];
    images: ProductImage[];   
    stores?: Store[];
    productAttributes?: ProductAttribute[];
    modeles?: ModelWithProduct[];
    modelAttributs?: ModelWithAttributs[];
    collections?: Collection[];
    weight: number;
    onlineShops?: OnlineShop[];
};


export type ProductAdmin = {
    productId: number;
    state: ProductState;
    supplierId: number;
    supplier?: Supplier;
    manufacturerReference: string;
    supplierReference: string;
    comment: string;
    buyPriceWithoutVat: number;
    barCode: string;
}

export type ProductWithAdmin = Product & Omit<ProductAdmin, "productId">;

export type ProductUpdate = {
    categoryId: number;
    subCategoryId: number;
    brandId: number;
    isPackage: boolean;
    price: number;
    vatRate: number;
    isGiftCard: boolean;
    giftCardDuration: number;
    status: ProductStatus;
    customization: boolean;   
    minStock: number;
    weight: number;
    buyPriceWithoutVat: number;
    supplierId: number;
    manufacturerReference: string;
    comment: string;
    state: ProductState;
}

export type ProductDescriptionUpdate = {
    title: string;
    lang: string;
    description: string;
}

export type ProductOnlineShop ={
    productId: number;
    onlineShop: OnlineShop;
}

export type ProductAdd = Omit<ProductAdmin, "productId" | "supplier" | "state" | "comment"> & {
    categoryId: number;
    subCategoryId: number;
    brandId: number;
    isPackage: boolean;
    price: number;
    vatRate: number;
    isGiftCard: boolean;
    giftCardDuration: number; 
    minStock: number;
    weight: number;
    stores: number[];
    collections: number[];
    productAttributes: ProductAttribute[];
    onlineShops: OnlineShop[];
    descriptions: ProductDescription[];
    customizable: boolean;
    customizations: Omit<Customization, "id">[];
    images?: ProductImageAdd[];
    pack?: number[];
}

export type ProductImageAdd = {
    productId: number;
    url: string;
    attributeValueId?: number;
    attribute?: ProductAttributeValues;
    file?: File;
}

export type ModelInfo = Pick<Model,"productId">;
export type InfoProductByOrder = {
  orderLineId: number;
  modelId:number;
  barCode: string;
  productId: number; 
  descriptions: ProductDescription[];
  titled: string;
  commandId: number;

};

export type ProductPack = {
    id: number;
    productId: number;
    modelId: number;
    modelAttributs?: ModelWithAttributs;
    modelProduct?: ModelWithProduct;
    product?: Product;
}


