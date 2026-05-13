import { z } from "zod"

export type Attribut = {
    id: number;
    nom: string;
    legende: string;
}

export type AttributValue = {
    id: number;
    id_attribut: number;
    nom: string;
}

export type AttributWithValues = Attribut & {
    attribut_valeurs: AttributValue[];
}

export type AttributFilter = {
    id: number;
    id_attribut: number;
    nom: string;
    couleur: string;
}

export type FilterAttribute = {
    id_filtre: number;
    id_attribut: number;
}

export type FilterAttributeValue = Omit<AttributFilter, 'id_attribut'> & {
    attribut_values: AttributValue[];
    productCount?: number;
}


export type FilterAttributePresenter = Omit<Attribut, 'legende'> & {
    filters: FilterAttributeValue[];
    type?: string;
    productCount?: number;
}

export type FilterAttributeInput = {
    id_attribute: number;
    attribute_value_ids: number[];
    attribute_value: any[];
    type: 'color' | 'attribute' | 'brand' | 'price' | 'size' | 'dynamic';
}

export type CreateAttributeRequest = Pick<Attribut, 'nom' | 'legende'>

export type AttributValueWithFilter = AttributValue & {
    linkedFilters: AttributFilter[];
}

export interface CreateAttributDetailRequest {
    name: string;
    legend: string;
    filters: Omit<AttributFilter, 'id' | 'id_attribut'>[];
    values: (Omit<AttributValue, 'id' | 'id_attribut'> & { linkedFilters: AttributFilter[]})[];
}

export interface UpdateAttributDetailRequest {
    id: number;
    name: string;
    legend: string;
    filters: AttributFilter[];
    values: AttributValueWithFilter[];
}
export type AttributDetail = UpdateAttributDetailRequest;

export type AttributValueWithFilterAttribute = AttributValue & {
    linkedFilters: FilterAttribute[];
}
  
export type FilterRequest = Pick< AttributFilter, 'id_attribut' | 'nom' | 'couleur'>
export type AttributValueRequest = Pick<AttributValue, 'id_attribut' | 'nom'>

// export const attributValueOptionsSchema = z.object({
//     limit: z.number().optional().default(50),
//     offset: z.number().optional().default(0),
//     sort: z.enum(['asc', 'desc']).optional().default('desc'),
//     search: z.string().optional().default(''),
// })

// export type AttributValueFilterInput = z.input<typeof attributValueOptionsSchema>;
// export type AttributValueFilter = z.infer<typeof attributValueOptionsSchema>;