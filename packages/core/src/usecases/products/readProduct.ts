import { Product } from "../../models";
import {  getInjection } from "../../types";


export const readProductUseCase = async (id : number): Promise<Product> => {

    const productRepository = await getInjection('IProductRepository');
    const product = await productRepository.readById(id);
    return product;
}