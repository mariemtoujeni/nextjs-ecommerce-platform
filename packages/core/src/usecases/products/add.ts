import { getInjection } from "../../types/di";
import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { Customization, Product, ProductAdd, ProductState, ProductStatus, ProductWithAdmin } from "../../models/Product";
import { Model, ModelAdmin, UserRoles } from "../../models";
import { SharedMemory } from "../../adapters/mock/SharedMemory";

export const addProductUseCase = async (productAdd: ProductAdd): Promise<ProductWithAdmin> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const productRepository = await getInjection("IProductRepository");
    const modelRepository = await getInjection("IModelRepository");
    const productCustomizationRepository = await getInjection("IProductCustomizationRepository");
    const storeRepository = await getInjection("IStoreRepository");
    const collectionRepository = await getInjection("ICollectionRepository");

    if (productAdd.isPackage && Array.isArray(productAdd.pack) && productAdd.pack.length > 0) {
        const packProducts = await Promise.all( productAdd.pack.map(p => productRepository.readById(p)) );
        const totalPrice = packProducts.reduce((sum, item) => sum + (item?.price ?? 0), 0);
        productAdd.price = totalPrice;
    }

    const product = await productRepository.create(productAdd);

    await storeRepository.addProductToStores(product.id, productAdd.stores);

    for (const collection of productAdd.collections) {
        await collectionRepository.createCollectionProduct({
            collectionId: collection,
            productId: product.id
        });
    }

    await productRepository.addOnlineShops(product.id, productAdd.onlineShops);

    const attributeValues: number[][] = [];
    for (const productAttribute of productAdd.productAttributes) {
        await productRepository.createAttribute(product.id, productAttribute);
        attributeValues.push(productAttribute.values.map(v => v.id));
    }

    const customizations: Customization[] = [];
    for (const productCustomization of productAdd.customizations) {
        const customization = await productCustomizationRepository.create(product.id, productCustomization);
        customizations.push(customization);
    }

    // Create models for each combination of attribute values
    const attributeValueCombinations: number[][] = [];

    // Get all possible combinations using recursive function
    const generateCombinations = (attributes: number[][], currentIndex: number, currentCombination: number[]) => {
        if (currentIndex === productAdd.productAttributes.length) {
            attributeValueCombinations.push([...currentCombination]);
            return;
        }

        for (const value of productAdd.productAttributes[currentIndex]!.values) {
            currentCombination[currentIndex] = value.id;
            generateCombinations(attributes, currentIndex + 1, currentCombination);
        }
    }

    generateCombinations(attributeValues, 0, new Array(productAdd.productAttributes.length));

    const models: ModelAdmin[] = [];
    for (const combination of attributeValueCombinations) {
        const model = await modelRepository.create({
            productId: product.id,
            priceWithoutVat: productAdd.price,
            priceWithVat: productAdd.price * (1 + productAdd.vatRate / 100),
            published: true,
            minStock: product.minStock,
            weight: product.weight,
            manufacturerReference: productAdd.manufacturerReference,
            supplierReference: productAdd.supplierReference,
            purchasePrice: productAdd.buyPriceWithoutVat,
            barcode: productAdd.barCode,
        });

        for (const attributeValue of combination) {
            await modelRepository.createAttribute(model.id, attributeValue);
        }

        //creates stock instance for the model 
        const stockRepository = await getInjection("IStockRepository"); 
        await stockRepository.createStock(model.id);

        models.push({ ...model, attributValues: combination.map(id => ({ idModel: model.id, idAttributValue: id, attributValue: SharedMemory.attribut_valeurs.find(attrVal => attrVal.id === id)! })) });
    }

    //ajout des images : 
    if (productAdd.images && productAdd.images.length > 0) {
        for (const img of productAdd.images) {
            if (!img.file) continue;
            const imageUploadService = await getInjection('IImageUploadService');
            const bucketName = 'produits'
            const folderPath = img.attributeValueId ? `${product.id}/${img.attributeValueId}` : `${product.id}`;
            const imgUrl = await imageUploadService.uploadImage(img.file, bucketName, folderPath, false);

            const productRepository = await getInjection("IProductRepository");
            await productRepository.addProductImage({
                productId: product.id,
                url: `${bucketName}${imgUrl}`,
                attributeValueId: img.attributeValueId ?? undefined
            });
        }
    }

    //ajout de produits pack :
    if (productAdd.isPackage && Array.isArray(productAdd.pack) && productAdd.pack.length > 0) {
        //here we dont care about prodId since it is just a wrapper for the models 
        //and the product pack id itself is what we need as ref in db
        await productRepository.addProductPack(product.id, productAdd.pack);            
    }

    return {
        ...product,
        id: product.id,
        productAttributes: productAdd.productAttributes,
        customizations: customizations,
        state: ProductState.NORMAL,
        supplierId: productAdd.supplierId,
        manufacturerReference: productAdd.manufacturerReference,
        supplierReference: productAdd.supplierReference,
        comment: "",
        buyPriceWithoutVat: productAdd.buyPriceWithoutVat,
        barCode: "",
        modeles: models.map(model => ({
            ...model,
            product: product,
        })),
    }
}