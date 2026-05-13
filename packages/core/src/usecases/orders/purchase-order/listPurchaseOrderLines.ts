import { PurchaseOrderLine, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";
import { ReadPurchaseOrderLineProps } from "../../../repositories";

export const listPurchaseOrderLinesUseCase = async (props: ReadPurchaseOrderLineProps): Promise<PurchaseOrderLine | PurchaseOrderLine[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');
    const purchaseOrderLines = await purchaseOrderRepository.readPurchaseOrderLine(props);
    if (Array.isArray(purchaseOrderLines)) {
        return purchaseOrderLines;
    }
    return purchaseOrderLines;
}