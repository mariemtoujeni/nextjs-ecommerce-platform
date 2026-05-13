import { getInjection } from "../../types";

export const deleteQuotationLineUseCase = async (id: number): Promise<void> => {
  const quotationRepository = await getInjection("IQuotationRepository");
  await quotationRepository.deleteQuotationLine(id);
};
