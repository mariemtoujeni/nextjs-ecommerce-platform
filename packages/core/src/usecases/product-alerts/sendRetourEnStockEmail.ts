import { ProductAlert } from "../../models";
import { getInjection } from "../../types";

export const sendRetourEnStockEmailUseCase = async (productAlert: ProductAlert): Promise<boolean> => {
    const emailService = await getInjection("IEmailService");

    const emailResponse = await emailService.sendRetourEnStockEmail(productAlert);

    return emailResponse.success;
};
