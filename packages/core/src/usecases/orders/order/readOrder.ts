import { Order, UserRoles } from "../../../models";
import { ErrorCodes, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const readOrderUseCase = async (orderId: number): Promise<Order> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const orderLineRepository = await getInjection("IOrderRepository");
    const orderLine = await orderLineRepository.readById(orderId);
    return orderLine;
}