import { PurchaseOrderPresenter, PurchaseOrderPresenterInput, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const createPurchaseOrderWithLinesUseCase = async (purchaseOrder: PurchaseOrderPresenterInput): Promise<PurchaseOrderPresenter> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');

    const createdPurchaseOrder = await purchaseOrderRepository.createPurchaseOrderPresenter(purchaseOrder);
    return createdPurchaseOrder;
}