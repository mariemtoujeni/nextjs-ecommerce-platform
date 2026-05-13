import { ProductAlert, productAlertOptionsSchema, ProductFilterInput } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";


export const listAllProductAlertsUseCase = async (options?: ProductFilterInput): Promise<ReturnAll<ProductAlert>> => {

    const validatedOptions = productAlertOptionsSchema.safeParse(options || {});

    if (!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const productAlertRepository = await getInjection('IProductAlertRepository');

    const productAlerts = await productAlertRepository.read(validatedOptions.data);

    return productAlerts;
}