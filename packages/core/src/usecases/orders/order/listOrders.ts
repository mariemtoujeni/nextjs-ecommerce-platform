import { OrderFilterInput, OrderPresenter, UserRoles, OrderOptionsSchema } from "../../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const listOrdersUseCase = async (options?: OrderFilterInput): Promise<ReturnAll<OrderPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const optionsValidated = OrderOptionsSchema.parse(options);

    const orderRepository = await getInjection("IOrderRepository");
    const orders = await orderRepository.readAllOrderPresenter({
        options: optionsValidated
    });
    return orders;
}