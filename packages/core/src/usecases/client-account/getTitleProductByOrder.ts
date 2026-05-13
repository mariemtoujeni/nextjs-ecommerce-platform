import { InfoProductByOrder } from "../../models";
import { getInjection } from "../../types";


export const getTitleProductByOrderUseCase = async (commandId: number): Promise<InfoProductByOrder[]> => {
    const productRepository = await getInjection('IProductRepository');
    const products = await productRepository.getTitleProductByOrder(commandId)
    return products;

}