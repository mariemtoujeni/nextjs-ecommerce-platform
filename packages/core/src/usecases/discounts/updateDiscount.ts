import { Discount } from "../../models";
import { getInjection } from "../../types/di";

export const updateDiscountUseCase = async (discount: Partial<Discount> & { id: number }): Promise<Discount> => {
    const discountRepository = await getInjection('IDiscountRepository');
    
    const oldDiscount = await discountRepository.readDiscountById(discount.id);
    const updatedDiscount = await discountRepository.updateDiscount({
        ...oldDiscount,
        ...discount,
    });

    return updatedDiscount;
}