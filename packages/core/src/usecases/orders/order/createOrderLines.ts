import { OrderLine, OrderLineInput, UserRoles } from "../../../models";
import { ErrorCodes, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const createOrderLinesUseCase = async (orderLines: OrderLineInput[]): Promise<OrderLine[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const orderLineRepository = await getInjection("IOrderRepository");
    const createdOrderLines = await orderLineRepository.createOrderLines(orderLines);
    return createdOrderLines;
}