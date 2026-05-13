import { PurchaseOrderPresenter, PurchaseOrderPresenterInput, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, ReturnOne } from "../../../types";
import { UnauthorizedError } from "../../../types/error";

export const updatePurchaseOrderWithLinesUseCase = async (id: number, purchaseOrder: PurchaseOrderPresenterInput): Promise<ReturnOne<PurchaseOrderPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');
    const updatedPurchaseOrder = await purchaseOrderRepository.updatePurchaseOrder(id, purchaseOrder);        
    return updatedPurchaseOrder;
}