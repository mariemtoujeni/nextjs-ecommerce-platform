import { FilterAttribute, AttributDetail, UserRoles } from "../../models";
import { BATCH_SIZE, chunkArray, getInjection } from "../../types";
import { ErrorCodes, UnauthorizedError } from "../../types/error";

export const readAttributeUseCase = async (id: number) : Promise<AttributDetail> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const attributeRepository = await getInjection("IAttributRepository");
    const attribute = await attributeRepository.readAttribute(id);
    const filters = await attributeRepository.readFiltersByAttributeId(id);    
    
    const attributeValues = await attributeRepository.readValuesByAttributeId(id);
    
    // Then get all filter attributes for these values in batches
    const valueIds = attributeValues.map(v => v.id);
    
    let filterAttributes: FilterAttribute[] = [];
    for (const batch of chunkArray(valueIds, BATCH_SIZE)) {
        if (batch.length === 0) continue;
        const filterAttributeBatch = await attributeRepository.readFilterAttributesByAttributeValueId(batch);
        filterAttributes = filterAttributes.concat(filterAttributeBatch ?? []);
    }
    
    // Group filter attributes by attribute value id
    const filterAttributesByValueId = filterAttributes.reduce((acc, filter) => {
        if (!acc[filter.id_attribut]) {
            acc[filter.id_attribut] = [];
        }
        acc[filter.id_attribut]?.push(filter);
        return acc;
    }, {} as Record<number, FilterAttribute[]>);
    
    // Combine the data
    const values = attributeValues.map(value => ({
        ...value,
        linkedFilters: filterAttributesByValueId[value.id] || []
    }));
    
    const valuesWithLinkedFilters = await Promise.all(values.map(async (value) => {
        try {
            const attributeValues = await attributeRepository.readAllFilterAttributesByAttributeValueId(value.id);
            const linkedFilters =  filters.filter((filter) => attributeValues.some((av: FilterAttribute) => av.id_filtre === filter.id));
            return {
                ...value,
                linkedFilters
            }
        } catch (error) {
            return {
                ...value,
                linkedFilters: []
            }
        }
    }));
    return {
        id: attribute.id,
        name: attribute.nom,
        legend: attribute.legende,
        filters,
        values: valuesWithLinkedFilters,
    }
}