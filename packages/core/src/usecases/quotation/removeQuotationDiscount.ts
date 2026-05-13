import { getInjection } from "../../types";

export const deleteQuotationDiscountUseCase = async (id: number): Promise<void> => {
  const quotationRepository = await getInjection("IQuotationRepository");
  await quotationRepository.deleteQuotationDiscount(id);
};
