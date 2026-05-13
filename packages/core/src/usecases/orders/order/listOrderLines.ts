import { OrderLine, UserRoles } from "../../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const listOrderLinesUseCase = async (orderId: number): Promise<ReturnAll<OrderLine>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const orderLineRepository = await getInjection("IOrderRepository");
    const orderLines = await orderLineRepository.readAllOrderLines(orderId);
    return orderLines;
}