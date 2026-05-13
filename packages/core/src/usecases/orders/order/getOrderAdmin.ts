import { getInjection } from "../../../types/di";
import { OrderWithClient, UserRoles } from "../../../models";
import { ErrorCodes, UnauthorizedError } from "../../../types/error";

export const getOrderAdmin = async (id: number): Promise<OrderWithClient> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if(!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS)
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN])

    const orderRepository = await getInjection("IOrderRepository");
    const order = await orderRepository.readAdmin(id);

    return order;
}