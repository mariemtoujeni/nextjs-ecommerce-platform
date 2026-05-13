import { BadRequestError, ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../types";
import { Discount, DiscountFilterInput, discountOptionsSchema, UserRoles } from "../../models";

export const listAllDiscountsUseCase = async (options?: DiscountFilterInput): Promise<ReturnAll<Discount>> => {
    
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const validatedOptions = discountOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }
    const discountRepository = await getInjection('IDiscountRepository');

    const discounts = await discountRepository.readAll(validatedOptions.data);
    return discounts;
}