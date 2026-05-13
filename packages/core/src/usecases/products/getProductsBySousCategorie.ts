import { Product } from "../../models";
import {  getInjection } from "../../types";

export const getProductsBySousCategorie = async (productId: number): Promise<Product[]> => {
    const productRepository = await getInjection('IProductRepository');

    // Retrieve the product to get its subCategoryId
    const product = await productRepository.readById(productId);
    const subCategoryId = product.subCategoryId;   
    

    // Fetch products by subCategoryId, excluding the current product
    const similarProducts = await productRepository.findBySubCategoryId(subCategoryId, productId);

    return similarProducts;
}

