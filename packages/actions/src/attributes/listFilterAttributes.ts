"use server"

import { listFilterAttributesUseCase } from "@repo/core/usecases";
import { ReturnAll } from "@repo/core/types";
import { FilterAttributePresenter } from "@repo/core/models";
import { listFilterAttributesProps } from "@repo/core/repositories";

export const listFilterAttributesAction = async (props?: listFilterAttributesProps) : Promise<ReturnAll<FilterAttributePresenter>> => {
    try {
        const filterAttributes = await listFilterAttributesUseCase(props);
        return {
            total: filterAttributes.length,
            items: filterAttributes,
            count: filterAttributes.length,
        };
    } catch (error: any) {
        return {
            total: 0,
            items: [] as FilterAttributePresenter[],
            count: 0,
            error: error.message,
        };
    }
}