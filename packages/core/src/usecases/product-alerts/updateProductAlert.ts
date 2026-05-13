import { getInjection } from "../../types";
import { ProductAlert } from "../../models";

export const updateProductAlertUseCase = async (productAlert: ProductAlert): Promise<ProductAlert> => {
    const productAlertRepository = await getInjection('IProductAlertRepository');
    const updatedProductAlert = await productAlertRepository.update(productAlert);

    return updatedProductAlert;
}