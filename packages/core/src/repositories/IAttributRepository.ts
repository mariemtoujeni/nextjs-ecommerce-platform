import { Attribut, AttributFilter, AttributValue, FilterAttribute, CreateAttributeRequest, AttributValueWithFilterAttribute, AttributWithValues, FilterAttributePresenter, FilterAttributeInput } from "../models";

export type listFilterAttributesProps = {
    store? : string;
    category? : string;
    sousCategory? : string;
    filterAttributeInput?: FilterAttributeInput[];
}

export interface IAttributRepository {
    readAllAttributes(): Promise<Attribut[]>;
    readAllAttributesWithValues(): Promise<AttributWithValues[]>;
    readAttribute(id: number): Promise<Attribut>;
    readFilterByNameAndAttributeId(name: string, id_attribut: number): Promise<AttributFilter>;
    readAllFilters(): Promise<AttributFilter[]>;
    readFiltersByAttributeId(id: number): Promise<AttributFilter[]>;
    readValuesByAttributeId(id: number): Promise<AttributValue[]>;

    createAttribute(attribute: CreateAttributeRequest): Promise<Attribut>;
    updateAttribute(attribute: Attribut): Promise<Attribut>;
    deleteAttribute(id: number): Promise<void>;
    readAllAttributeValues(): Promise<AttributValue[]>;
    createAttributeValue(attributeValue: Omit<AttributValue, 'id' | 'linkedFilters'>): Promise<AttributValue>;
    updateAttributeValue(attributeValue: Omit<AttributValue, 'linkedFilters'>): Promise<AttributValue>;
    deleteAttributeValue(id: number): Promise<void>;
    deleteAllAttributeValuesByFilterId(id_filtre: number): Promise<void>;
    createFilter(filter: Omit<AttributFilter, 'id'>): Promise<AttributFilter>;
    updateFilter(filter: AttributFilter): Promise<AttributFilter>;    
    deleteFilter(id: number): Promise<void>;
    readAllFilterAttributesByAttributeValueId(id_attribut_value: number): Promise<FilterAttribute[]>;
    readFilterAttributesByAttributeValueId(id_attribut_value: number[]): Promise<FilterAttribute[]>;
    createFilterAttribute(filterAttribute: FilterAttribute): Promise<FilterAttribute>;
    deleteFilterAttribute(filterAttribute: FilterAttribute): Promise<void>;
    deleteAllFilterAttributesByAttributeValueId(id_attribut_value: number): Promise<void>;

    // New batch operations
    updateFilters(filters: AttributFilter[]): Promise<AttributFilter[]>;
    createFilters(filters: AttributFilter[]): Promise<AttributFilter[]>;
    deleteFilters(ids: number[]): Promise<void>;
    updateAttributeValues(values: Omit<AttributValue, 'linkedFilters'>[]): Promise<AttributValue[]>;
    createAttributeValues(values: Omit<AttributValue, 'id' | 'linkedFilters'>[]): Promise<AttributValue[]>;
    deleteAttributeValues(ids: number[]): Promise<void>;
    deleteAllFilterAttributesByFilterIds(ids_filtre: number[]): Promise<void>;
    createFilterAttributes(filterAttributes: FilterAttribute[]): Promise<FilterAttribute[]>;
    deleteFilterAttributesByValueIds(valueIds: number[]): Promise<void>;
    deleteAllFilterAttributesByAttributeValueIds(id_attribut_values: number[]): Promise<void>;

    // For frontend
    readAllFilterAttributes(props?: listFilterAttributesProps): Promise<FilterAttributePresenter[]>;
}