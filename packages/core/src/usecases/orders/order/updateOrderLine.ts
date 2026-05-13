import { OrderLine, OrderLineInput, UserRoles, OrderLineSchema } from "../../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";


export const updateOrderLineUseCase = async (orderLine: OrderLineInput): Promise<OrderLine> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const validatedOrderLine = OrderLineSchema.parse(orderLine);

    const orderLineRepository = await getInjection("IOrderRepository");
    const updatedOrderLine = await orderLineRepository.updateOrderLine(validatedOrderLine);
    return updatedOrderLine;
}

export const updateOrderLinesUseCase = async (orderLines: OrderLineInput[]): Promise<OrderLine[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const validatedOrderLines = orderLines.map((orderLine) => OrderLineSchema.parse(orderLine));
    const orderLineRepository = await getInjection("IOrderRepository");
    const updatedOrderLines = await orderLineRepository.updateOrderLines(validatedOrderLines);
    return updatedOrderLines;
}