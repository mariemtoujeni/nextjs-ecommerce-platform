import { Supplier, SupplierInput, SupplierInputSchema } from "../../models";
import { getInjection } from "../../types";
import { BadRequestError, UnauthorizedError } from "../../types/error";
import { ErrorCodes } from "../../types";
import { UserRoles } from "../../models";

export const createSupplierUseCase = async (supplier: SupplierInput): Promise<Supplier> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const validatedSupplier = SupplierInputSchema.safeParse(supplier);
    if (!validatedSupplier.success) {
        throw new BadRequestError(validatedSupplier.error.message);
    }
    
    const supplierRepository = await getInjection("ISupplierRepository");
    const updatedSupplier = await supplierRepository.create(validatedSupplier.data);
    return updatedSupplier;
}