import { getInjection } from "../../types";
import { FilterAttributePresenter } from "../../models";
import { listFilterAttributesProps } from "../../repositories/IAttributRepository";

export const listFilterAttributesUseCase = async (props?: listFilterAttributesProps) : Promise<FilterAttributePresenter[]> => {
    const attributRepository = await getInjection("IAttributRepository");
    const filterAttributes = await attributRepository.readAllFilterAttributes(props);
    return filterAttributes;
}