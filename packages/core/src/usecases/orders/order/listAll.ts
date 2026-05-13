import { OrderFilterInput, OrderWithClient, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../../types";

export const listAllOrdersUseCase = async (options?: OrderFilterInput): Promise<ReturnAll<OrderWithClient>> => {
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN]);

    const orderRepository = await getInjection('IOrderRepository');
    const orders = await orderRepository.readAll({options: options});
    return orders;
}