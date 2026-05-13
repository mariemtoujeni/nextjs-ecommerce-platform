import { PurchaseOrderPresenter, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, ReturnOne, UnauthorizedError } from "../../../types";

export const getPurchaseOrderUseCase = async (id: string): Promise<ReturnOne<PurchaseOrderPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');
    const purchaseOrder = await purchaseOrderRepository.readPurchaseOrder(Number(id));
    return {
        item: purchaseOrder,
        error: undefined
    };
}