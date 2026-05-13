import { PurchaseOrderFilterInput, PurchaseOrderPresenter, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../../types";

export const listPurchaseOrderWithLinesUseCase = async (options?: PurchaseOrderFilterInput): Promise<ReturnAll<PurchaseOrderPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');
    const purchaseOrderWithLines = await purchaseOrderRepository.listPurchaseOrderPresenter(options);
    return purchaseOrderWithLines;
}