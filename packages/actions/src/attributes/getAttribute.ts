"use server"

import { readAttributeUseCase } from "@repo/core/usecases";
import { AttributDetail } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
export const getAttributeAction = async (id: number): Promise<ReturnOne<AttributDetail>> => {    
    try {
        const attribute = await readAttributeUseCase(id);
        return {
            item: attribute,
        };
    } catch (error: any) {
        return {
            item: null as unknown as AttributDetail,
            error: error.message,
        };
    }
}