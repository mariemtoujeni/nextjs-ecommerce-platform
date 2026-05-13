import { modelOptionsSchema, ModelWithProduct, ReadAllModelsWithProductProps } from "../../models";
import { BadRequestError, getInjection, ReturnAll } from "../../types";

export const listAllProductModelsUseCase = async (props: ReadAllModelsWithProductProps): Promise<ReturnAll<ModelWithProduct>> => {
    const validatedOptions = modelOptionsSchema.safeParse(props.options || {});

    if (!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const modelRepository = await getInjection('IModelRepository');
    const models = await modelRepository.readAllModelsWithProduct({
        options: validatedOptions.data,
        modelIds: props.modelIds,
        brandId: props.brandId,
        flag: props.flag
    });

    return models;
}

export const listAllProductModelsByIdArrayUseCase = async (modelIds?: number[]): Promise<ReturnAll<ModelWithProduct>> => {
    const modelRepository = await getInjection('IModelRepository');
    
    // If modelIds is empty or undefined, return empty result
    if (!modelIds || modelIds.length === 0) {
        return {
            items: [],
            total: 0,
            count: 0
        };
    }
    
    const models = await modelRepository.readAllModelsWithProduct({
        options: {
            limit: 10000,
            offset: 0,
            sort: 'asc'
        },
        modelIds: modelIds,
        brandId: undefined
    });

    return models;
}