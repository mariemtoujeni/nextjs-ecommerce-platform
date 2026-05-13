'use server';
import { Discount, DiscountFilterInput } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllDiscountsUseCase } from "@repo/core/usecases";

export const getAllDiscountAction = async (options?: DiscountFilterInput) => {
    try 
    {
        const discounts = await listAllDiscountsUseCase(options); 

        return discounts;
    } catch (error: any) {
        return {
            total: 0,
            items: [] as Discount[],
            count: 0,
            error: error.message,
        } as ReturnAll<Discount>;
    }
}