import { PurchaseOrderLine, PurchaseOrderLineInput, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const updatePurchaseOrderLineUseCase = async (props: PurchaseOrderLineInput): Promise<PurchaseOrderLine> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');
    const purchaseOrderLine = await purchaseOrderRepository.updatePurchaseOrderLine(props);
    return purchaseOrderLine;
}