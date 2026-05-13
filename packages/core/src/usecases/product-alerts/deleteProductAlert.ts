import { getInjection } from "../../types";


export const deleteProductAlertUseCase = async (id: number): Promise<void> => {

    const productAlertRepository = await getInjection('IProductAlertRepository');

    await productAlertRepository.delete(id);

}