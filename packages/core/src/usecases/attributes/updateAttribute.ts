import { AttributDetail, AttributFilter, FilterAttribute, UpdateAttributDetailRequest, UserRoles } from "../../models";
import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { BATCH_SIZE, chunkArray, getInjection } from "../../types";


export const updateAttributeUseCase = async (id: number, attribute: UpdateAttributDetailRequest): Promise<AttributDetail> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const attributeRepository = await getInjection("IAttributRepository");
    
    const currentAttribute = await attributeRepository.readAttribute(id);
    const currentFilters = await attributeRepository.readFiltersByAttributeId(id);    
    const attributeValues  = await attributeRepository.readValuesByAttributeId(id);

    const allFilters = await attributeRepository.readAllFilters();
    const allAttributeValues = await attributeRepository.readAllAttributeValues();

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
    const currentValues = attributeValues.map(value => ({
        ...value,
        linkedFilters: filterAttributesByValueId[value.id] || []
    }));

    // Update attribute if needed
    if (currentAttribute.nom !== attribute.name || currentAttribute.legende !== attribute.legend) {
        await attributeRepository.updateAttribute({
            id: currentAttribute.id,
            nom: attribute.name,
            legende: attribute.legend
        });
    }

    // Prepare batch operations for filters
    const filtersToUpdate = attribute.filters.filter(filter => 
        currentFilters.some(f => f.id === filter.id && (f.nom !== filter.nom || f.id_attribut !== filter.id_attribut || f.couleur !== filter.couleur))
    );
    
    const filtersToCreate = attribute.filters.filter(filter => 
        !currentFilters.some(f => f.id === filter.id)
    );
    
    const filtersToDelete = currentFilters.filter(filter => 
        !attribute.filters.some(f => f.id === filter.id)
    );

    // Execute batch operations for filters
    if (filtersToUpdate.length > 0) {
        await attributeRepository.updateFilters(filtersToUpdate);
    }
    
    // Create new filters
    let newFilters: AttributFilter[] = [];
    if (filtersToCreate.length > 0) {
        let maxId = Math.max(...allFilters.map(f => f.id));        
        // formation des données à créer
        const newFiltersRequest = filtersToCreate.map(f => {
            maxId = maxId + 1;
            return {
                id: maxId,
                nom: f.nom,
                id_attribut: f.id_attribut,
                couleur: f.couleur
            }
        }); 
        newFilters = await attributeRepository.createFilters(newFiltersRequest);
    }
    
    // Delete all filter attributes for the filters to delete
    if (filtersToDelete.length > 0) {
        await attributeRepository.deleteAllFilterAttributesByFilterIds(filtersToDelete.map(f => f.id));
        await attributeRepository.deleteFilters(filtersToDelete.map(f => f.id));
    }

    // Prepare batch operations for attribute values
    const valuesToUpdate = attribute.values.filter(value => 
        currentValues.some(v => v.id === value.id && (v.nom !== value.nom || v.id_attribut !== value.id_attribut))
    );
    
    const valuesToCreate = attribute.values.filter(value => 
        !currentValues.some(v => v.id === value.id)
    );
    
    const valuesToDelete = currentValues.filter(value => 
        !attribute.values.some(v => v.id === value.id)
    );

    // Update Attribute Values that have name or id_attribut changed
    if (valuesToUpdate.length > 0) {
        await attributeRepository.updateAttributeValues(valuesToUpdate.map(({linkedFilters, ...value}) => value));
    }

    // Create new values
    if (valuesToCreate.length > 0) {
        // Create new values
        let maxId = Math.max(...allAttributeValues.map(f => f.id));
        const createdValuesRequest = valuesToCreate.map(({linkedFilters, ...value}) => {            
            maxId = maxId + 1;
            return {
                id: maxId,
                id_attribut: value.id_attribut,
                nom: value.nom
            };
        });
        const createdValues = await attributeRepository.createAttributeValues(createdValuesRequest);
        
        // Prepare filter attribute relations for new values
        const filterAttributesToCreate = createdValues.flatMap(value => {
            const originalValue = valuesToCreate.find(v => v.nom === value.nom && v.id_attribut === value.id_attribut);
            if (!originalValue) return [];            

            const p_newFilters = newFilters.filter(filter => {
                return originalValue.linkedFilters.some(f => f.nom === filter.nom && f.couleur === filter.couleur)
            });
                        
            return originalValue.linkedFilters.map(filter => ({
                id_filtre: filter.id > 0 ? filter.id : p_newFilters.find(f => f.nom === filter.nom && f.couleur === filter.couleur)?.id ?? 0,
                id_attribut: value.id
            }));
        });
        
        // Create filter attributes in batch
        if (filterAttributesToCreate.length > 0) {
            await attributeRepository.createFilterAttributes(filterAttributesToCreate.map(attr => {
                return {
                    id_filtre: attr.id_filtre > 0 ? attr.id_filtre : 0,
                    id_attribut: attr.id_attribut
                }
            }));
        }
    }
    
    // Delete all attributes for the values to delete
    if (valuesToDelete.length > 0) {
        // First delete from filtre_attributs table
        await attributeRepository.deleteAllFilterAttributesByAttributeValueIds(valuesToDelete.map(v => v.id));
        // Then delete from attribut_valeurs table
        await attributeRepository.deleteAttributeValues(valuesToDelete.map(v => v.id));
    }

    // Update filter attributes table (jonction table between attribut_valeurs and filtres) for existing values
    // start by getting the values that have linked filters changed
    const valuesToUpdateLinkedFilters = attribute.values.filter(value => {
        const currentValue = currentValues.find(v => v.id === value.id);
        if (!currentValue) return false;
        
        return value.linkedFilters.length !== currentValue.linkedFilters.length || 
            value.linkedFilters.some(f => !currentValue.linkedFilters.some(cf => cf.id_filtre === f.id));
    });

    const filterAttributesToUpdate = valuesToUpdateLinkedFilters.flatMap( value => {        
        // check if the filter is in the currentFilter  
        const arrayOfSubFilterAttributesToUpdate = value.linkedFilters.map(f => {
            if(currentFilters.length > 0) {
                const currentFilter = currentFilters.find(cf => f.id === cf.id && f.nom === cf.nom && f.couleur === cf.couleur);
                if(currentFilter) {
                    return {
                        id_filtre: currentFilter.id,
                        id_attribut: value.id
                    }
                }
            }
            if(newFilters.length > 0) {
                const newFilter = newFilters.find(f => f.nom === f.nom && f.couleur === f.couleur);
                if(newFilter) {
                    return {
                        id_filtre: newFilter.id,
                        id_attribut: value.id
                    }
                }
            }
        });
        return arrayOfSubFilterAttributesToUpdate;
    });
    
    if (filterAttributesToUpdate.length > 0) {
        // delete all filter attributes that are not in the array of valuesToUpdateLinkedFilters
        const filterAttributesToDelete = filterAttributes.filter(attr => valuesToUpdateLinkedFilters.some(v => v.id === attr.id_attribut));
        if(filterAttributesToDelete.length > 0) {
            await attributeRepository.deleteAllFilterAttributesByAttributeValueIds(filterAttributesToDelete.map(attr => attr.id_attribut));
        }
        await attributeRepository.createFilterAttributes(filterAttributesToUpdate.filter(attr => attr !== undefined));
    }

    const updatedAttribute = await attributeRepository.readAttribute(id);
    const updatedFilters = await attributeRepository.readFiltersByAttributeId(id);
    const updatedValues = await attributeRepository.readValuesByAttributeId(id);

    const updatedAttributeDetail = {
        id: updatedAttribute.id,
        name: updatedAttribute.nom,
        legend: updatedAttribute.legende,
        filters: updatedFilters,
        values: await Promise.all(updatedValues.map(async (value) => {
            try {
                const attributeValues = await attributeRepository.readAllFilterAttributesByAttributeValueId(value.id);
                const linkedFilters =  updatedFilters.filter((filter) => attributeValues.some((av: FilterAttribute) => av.id_filtre === filter.id));
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
        }))
    }
    return updatedAttributeDetail;
}

