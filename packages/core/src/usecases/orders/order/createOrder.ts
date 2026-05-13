import { Order, OrderInput, UserRoles, OrderInputSchema } from "../../../models";
import { ErrorCodes, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const createOrderUseCase = async (order: OrderInput): Promise<Order> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const validatedOrder = OrderInputSchema.parse(order);

    const orderRepository = await getInjection("IOrderRepository");
    const createdOrder = await orderRepository.createOrder(validatedOrder);
    return createdOrder;
}
