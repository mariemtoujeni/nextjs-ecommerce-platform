import { AttributWithValues, Category } from "../../models";
import { getInjection } from "../../types";

export const readAllAttributesWithValuesUseCase = async (): Promise<AttributWithValues[]> => {
  const attributeRepository = await getInjection("IAttributRepository");
  const attributesWithValues = await attributeRepository.readAllAttributesWithValues();

  return attributesWithValues;
}; 