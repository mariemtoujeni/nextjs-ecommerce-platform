import {  InfoProductByOrder, OnlineShop, Product, ProductAdd, 
    ProductAttribute, ProductDescriptionUpdate, ProductFilter, ProductImage, ProductImageAdd, ProductPack, ProductUpdate, 
    ProductWithAdmin } from "../models/Product";
import { FilterAttributeInput } from "../models/Attributes";
import { ReturnAll } from "../types/utils";

export interface IProductRepository {
    create(product: Omit<ProductAdd, "productAttributes" | "modeles" | "modelAttributs" | "productCustomizations" | "productAttributes">): Promise<Product>;
    createAttribute(productId: number, attribute: ProductAttribute): Promise<void>;
    
    readAll(): Promise<Product[]>;
    read(options: ProductFilter, filterFrontend?: FilterAttributeInput[]): Promise<ReturnAll<ProductWithAdmin>>;
    readById(id: number): Promise<Product>;
    findBySubCategoryId(subCategoryId: number, productId: number): Promise<Product[]>;
    readOnlineShopsByProductId(id: number): Promise<OnlineShop[]>;
    readAdmin(id: number): Promise<ProductWithAdmin>;
    readAdminByModelId(modelId: number): Promise<ProductWithAdmin>;
    update(id: number, data: ProductUpdate): Promise<void>;
    updateDescription(id: number, data: ProductDescriptionUpdate): Promise<void>;
    addOnlineShops(id: number, shops: OnlineShop[]): Promise<void>;
    removeOnlineShops(id: number, shops: OnlineShop[]): Promise<void>;
    getTitleProductByOrder(commandId:number) : Promise<InfoProductByOrder[]>;

    
    addProductImage(img: ProductImageAdd): Promise<ProductImage>;

    getPack(id: number): Promise<ProductPack[]>;
    addProductPack(productId: number, associatedProductIds: number[]): Promise<number[]>;
    deleteProductFromPack(productId: number, associatedProductId: number): Promise<void>;

    updatePricesWithVAT(productId: number, vatRate: number): Promise<void>;
}
