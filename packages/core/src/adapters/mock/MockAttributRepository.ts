import { InternalServerError } from '../../types/error';
import { Attribut, AttributValue, AttributWithValues, AttributFilter, FilterAttribute, FilterAttributePresenter } from '../../models';
import { IAttributRepository, listFilterAttributesProps } from '../../repositories';
import { SharedMemory } from './SharedMemory';

export class MockAttributRepository implements IAttributRepository {

    async readAllAttributes(): Promise<Attribut[]> {
        return SharedMemory.attributs;
    }

    async readAttribute(id: number): Promise<Attribut> {
        const attribut = SharedMemory.attributs.find(attribut => attribut.id === id);
        if (!attribut) {
            throw new InternalServerError('Attribut not found');
        }
        return attribut;
    }

    async readAllFilters(): Promise<AttributFilter[]> {
        return SharedMemory.filtres;
    }

    async readFilterByNameAndAttributeId(name: string, id_attribut: number): Promise<AttributFilter> {
        const filter = SharedMemory.filtres.find(filtre => filtre.nom === name && filtre.id_attribut === id_attribut);
        if (!filter) {
            throw new InternalServerError('Filter not found');
        }
        return filter;
    }
    
    async readFiltersByAttributeId(id: number): Promise<AttributFilter[]> {
        return SharedMemory.filtres.filter(filtre => filtre.id_attribut === id);
    }

    async readValuesByAttributeId(id: number): Promise<AttributValue[]> {
        return SharedMemory.attribut_valeurs.filter(valeur => valeur.id_attribut === id);
    }

    async readAllAttributesWithValues(): Promise<AttributWithValues[]> {
        return SharedMemory.attributs.map(attribut => ({
            ...attribut,
            attribut_valeurs: SharedMemory.attribut_valeurs.filter(valeur => valeur.id_attribut === attribut.id)
        }));
    }

    async createAttribute(attribute: Attribut): Promise<Attribut> {
        // Get Max value of id
        const id_new_attribute = Math.max(...SharedMemory.attributs.map(attribut => attribut.id)) + 1;
        const newAttribute = { ...attribute, id: id_new_attribute };
        SharedMemory.attributs.push(newAttribute);
        return newAttribute;
    }
    
    async updateAttribute(attribute: Attribut): Promise<Attribut> {
        const index = SharedMemory.attributs.findIndex(attribut => attribut.id === attribute.id);
        if (index === -1) {
            throw new InternalServerError('Attribut not found');
        }
        SharedMemory.attributs[index] = attribute;
        return attribute;
    }

    async deleteAttribute(id: number): Promise<void> {
        SharedMemory.attributs = SharedMemory.attributs.filter(attribut => attribut.id !== id);
    }

    async readAllAttributeValues(): Promise<AttributValue[]> {
        return SharedMemory.attribut_valeurs;
    }
    
    async createAttributeValue(attributeValue: AttributValue): Promise<AttributValue> {
        const id_new_attribute_value = Math.max(...SharedMemory.attribut_valeurs.map(valeur => valeur.id)) + 1;
        const newAttributeValue = { ...attributeValue, id: id_new_attribute_value };
        SharedMemory.attribut_valeurs.push(newAttributeValue);
        return newAttributeValue;
    }

    async updateAttributeValue(attributeValue: AttributValue): Promise<AttributValue> {
        const index = SharedMemory.attribut_valeurs.findIndex(valeur => valeur.id === attributeValue.id);
        if (index === -1) {
            throw new InternalServerError('Attribut value not found');
        }
        SharedMemory.attribut_valeurs[index] = attributeValue;
        return attributeValue;
    }   

    async deleteAttributeValue(id: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async deleteAllAttributeValuesByFilterId(id_filtre: number): Promise<void> {
        SharedMemory.filtres_attributs = SharedMemory.filtres_attributs.filter(valeur => valeur.id_filtre !== id_filtre);
    }

    async createFilter(filter: AttributFilter): Promise<AttributFilter> {
        const id_new_filter = Math.max(...SharedMemory.filtres.map(filtre => filtre.id)) + 1;
        const newFilter = { ...filter, id: id_new_filter };
        SharedMemory.filtres.push(newFilter);
        return newFilter;
    }

    async updateFilter(filter: AttributFilter): Promise<AttributFilter> {
        const index = SharedMemory.filtres.findIndex(filtre => filtre.id === filter.id);
        if (index === -1) {
            throw new InternalServerError('Filter not found');
        }
        SharedMemory.filtres[index] = filter;
        return filter;
    }

    async deleteFilter(id: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async createFilterAttribute(filterAttribute: FilterAttribute): Promise<FilterAttribute> {        
        const newFilterAttribute = { ...filterAttribute };
        SharedMemory.filtres_attributs.push(newFilterAttribute);
        return newFilterAttribute;
    }

    async deleteFilterAttribute(filterAttribute: FilterAttribute): Promise<void> {
        throw new Error('Not implemented');
    }

    async deleteAllFilterAttributesByAttributeValueId(id_attribut_value: number): Promise<void> {
        const index = SharedMemory.filtres_attributs.findIndex(filtre_attribut => filtre_attribut.id_attribut === id_attribut_value);
        if (index === -1) {
            throw new InternalServerError('Filter attribute not found');
        }
        SharedMemory.filtres_attributs.splice(index, 1);
    }

    async readAllFilterAttributesByAttributeValueId(id_attribut_value: number): Promise<FilterAttribute[]> {
        return SharedMemory.filtres_attributs.filter(filtre_attribut => filtre_attribut.id_attribut === id_attribut_value);
    }

    async readFilterAttributesByAttributeValueId(id_attribut_values: number[]): Promise<FilterAttribute[]> {
        return SharedMemory.filtres_attributs.filter(filtre_attribut => id_attribut_values.includes(filtre_attribut.id_attribut));
    }

    // New batch operations
    async updateFilters(filters: AttributFilter[]): Promise<AttributFilter[]> {
        const updatedFilters = filters.map(filter => {
            const index = SharedMemory.filtres.findIndex(filtre => filtre.id === filter.id);
            if (index === -1) {
                throw new InternalServerError('Filter not found');
            }
            SharedMemory.filtres[index] = filter;
            return filter;
        });
        return updatedFilters;
    }

    async createFilters(filters: AttributFilter[]): Promise<AttributFilter[]> {
        const newFilters = filters.map(filter => {
            const id_new_filter = Math.max(...SharedMemory.filtres.map(filtre => filtre.id)) + 1;
            const newFilter = { ...filter, id: id_new_filter };
            SharedMemory.filtres.push(newFilter);
            return newFilter;
        });
        return newFilters;
    }
    
    async deleteFilters(ids: number[]): Promise<void> {
        SharedMemory.filtres = SharedMemory.filtres.filter(filtre => !ids.includes(filtre.id));
    }

    async updateAttributeValues(values: AttributValue[]): Promise<AttributValue[]> {
        const updatedValues = values.map(value => {
            const index = SharedMemory.attribut_valeurs.findIndex(valeur => valeur.id === value.id);
            if (index === -1) {
                throw new InternalServerError('Attribut value not found');
            }
            SharedMemory.attribut_valeurs[index] = value;
            return value;
        });
        return updatedValues;
    }
    
    async createAttributeValues(values: AttributValue[]): Promise<AttributValue[]> {
        const newValues = values.map(value => {
            const id_new_attribute_value = Math.max(...SharedMemory.attribut_valeurs.map(valeur => valeur.id)) + 1;
            const newAttributeValue = { ...value, id: id_new_attribute_value };
            SharedMemory.attribut_valeurs.push(newAttributeValue);
            return newAttributeValue;
        });
        return newValues;
    }

    async deleteAttributeValues(ids: number[]): Promise<void> {
        SharedMemory.attribut_valeurs = SharedMemory.attribut_valeurs.filter(valeur => !ids.includes(valeur.id));
    }

    async deleteAllFilterAttributesByFilterIds(ids_filtre: number[]): Promise<void> {
        SharedMemory.filtres_attributs = SharedMemory.filtres_attributs.filter(valeur => !ids_filtre.includes(valeur.id_filtre));
    }

    async deleteAllFilterAttributesByAttributeValueIds(id_attribut_values: number[]): Promise<void> {
        SharedMemory.filtres_attributs = SharedMemory.filtres_attributs.filter(valeur => !id_attribut_values.includes(valeur.id_attribut));
    }

    async createFilterAttributes(filterAttributes: FilterAttribute[]): Promise<FilterAttribute[]> {
        const newFilterAttributes = filterAttributes.map(filterAttribute => {
            const newFilterAttribute = { ...filterAttribute };
            SharedMemory.filtres_attributs.push(newFilterAttribute);
            return newFilterAttribute;
        });
        return newFilterAttributes;
    }
    
    async deleteFilterAttributesByValueIds(valueIds: number[]): Promise<void> {
        SharedMemory.filtres_attributs = SharedMemory.filtres_attributs.filter(filtre_attribut => !valueIds.includes(filtre_attribut.id_attribut));
    }

    // For frontend
    async readAllFilterAttributes(props?: listFilterAttributesProps): Promise<FilterAttributePresenter[]> {
        throw new Error("Not implemented");
    }
}

