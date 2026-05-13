import { IProductRepository } from "../../repositories/IProductRepository";
import { InfoProductByOrder, OnlineShop, Product, ProductAdd, ProductAttribute, 
    ProductDescriptionUpdate, ProductFilter, ProductImage, ProductPack, ProductStatus, 
    ProductUpdate, ProductWithAdmin } from "../../models/Product";
import { SharedMemory } from "./SharedMemory";
import { NotFoundError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { FilterAttributeInput } from "../../models/Attributes";

export class MockProductRepository implements IProductRepository {
    deleteProductFromPack(productId: number, associatedProductId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async updatePricesWithVAT(productId: number, vatRate: number): Promise<void> {
        const product = SharedMemory.products.find(p => p.id === productId);
        if (!product) {
            throw new NotFoundError(`Product with id ${productId} not found`);
        }

        if (product.vatRate !== vatRate) {
            product.vatRate = vatRate;
            product.price = product.price; 

            (product as any).prix_vente_ttc = product.price * (1 + vatRate / 100);
        }

        if (product.modeles && product.modeles.length > 0) {
            product.modeles.forEach(model => {
                model.priceWithoutVat = model.priceWithoutVat; 
                (model as any).prix_vente_ttc = model.priceWithoutVat * (1 + vatRate / 100);
            });
        }
    }

    addProductPack(productId: number): Promise<number[]> {
        throw new Error("Method not implemented.");
    }
    addProductImage(img: ProductImage): Promise<ProductImage> {
        throw new Error("Method not implemented.");
    }
    getPack(id: number): Promise<ProductPack[]> {
        throw new Error("Method not implemented.");
    }
    
    getTitleProductByOrder(commandId: number): Promise<InfoProductByOrder[]> {
        throw new Error("Method not implemented.");
    }

    
    async findBySubCategoryId(subCategoryId: number, productId?: number): Promise<Product[]> {
        const products = SharedMemory.products.filter(
            (product) => product.subCategoryId === subCategoryId
        );
        if (productId !== undefined) {
            products.filter((product) => product.id === productId);
        }
        return products;
    }

    async readAll(): Promise<Product[]> {
        return SharedMemory.products;
    }

    async read(options: ProductFilter, optionsFilterAttribute?: FilterAttributeInput[]): Promise<ReturnAll<ProductWithAdmin>> {
        const { limit, offset, sort } = options;

        const prodcuts = 'asc' == sort 
            ? [...SharedMemory.products].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
            : [...SharedMemory.products].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

        return {
            total: SharedMemory.products.length,
            count: prodcuts.length,
            items: prodcuts as ProductWithAdmin[]
        };
    }
 
    async readById(id: number): Promise<Product> {
        const product = SharedMemory.products.find((product) => product.id === id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        return product;
    }

    async readAdmin(id: number): Promise<ProductWithAdmin> {
        const product = SharedMemory.products.find((product) => product.id === id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        const productAdmin = SharedMemory.productAdmin.find((productAdmin) => productAdmin.productId === id);
        if (!productAdmin) {
            throw new NotFoundError("Product admin not found");
        }
        return { ...product, ...productAdmin };
    }

    async readAdminByModelId(modelId: number): Promise<ProductWithAdmin> {
        throw new Error("Not implemented");
    
    }

    async update(id: number, data: ProductUpdate): Promise<void> {
        const product = SharedMemory.products.find((product) => product.id === id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        Object.assign(product, data);
        
        const productAdmin = SharedMemory.productAdmin.find((productAdmin) => productAdmin.productId === id);
        if (!productAdmin) {
            throw new NotFoundError("Product admin not found");
        }
        Object.assign(productAdmin, data);
    }

    async updateDescription(id: number, data: ProductDescriptionUpdate): Promise<void> {
        const product = SharedMemory.products.find((product) => product.id === id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        const description = product.descriptions.find((description) => description.lang === data.lang); 
        if (description) {
            description.title = data.title;
            description.description = data.description;
        } else {
            product.descriptions.push(data);
        }
    }

    async readOnlineShopsByProductId(id: number): Promise<OnlineShop[]> {
        return SharedMemory.productOnlineShopes.filter(shop => shop.productId === id).map(shop => shop.onlineShop);
    }
    async addOnlineShops(id: number, shops: OnlineShop[]): Promise<void> {
        SharedMemory.productOnlineShopes.push(...shops.map(shop => ({ productId: id, onlineShop: shop })));
    }
    async removeOnlineShops(id: number, shops: OnlineShop[]): Promise<void> {
        SharedMemory.productOnlineShopes = SharedMemory.productOnlineShopes.filter(shop => shop.productId !== id || !shops.includes(shop.onlineShop));
    }

    async create(productAdd: Omit<ProductAdd, "productAttributes" | "modeles" | "modelAttributs" | "productCustomizations">): Promise<Product> {
        const productId = SharedMemory.products.length + 1;

        const product: Product = {
            ...productAdd,
            id: productId,
            modeles: [],
            modelAttributs: [],
            customizations: [],
            category: { id: productAdd.categoryId, name: "Test Category", active: 1, order: 1 },
            subCategory: { id: productAdd.subCategoryId, name: "Test Sub Category", active: 1, order: 1 },
            brand: { id: productAdd.brandId, name: "Test Brand" },
            status: ProductStatus.DRAFT,
            customization: false,
            createdAt: "",
            updatedAt: "",
            images: [],
            stores: [],
            collections: [],
            onlineShops: [],
        }

        SharedMemory.products.push(product);
        return product;
    }
    async createAttribute(productId: number, attribute: ProductAttribute): Promise<void> {
        const attributesToAdd = attribute.values.map(value => ({
            productId: productId,
            attributeId: attribute.id,
            attributeValueId: value.id,
        }));
        SharedMemory.productAttributes.push({productId: productId, attributeId: attribute.id});
        SharedMemory.productAttributeValues.push(...attributesToAdd);
    }
}