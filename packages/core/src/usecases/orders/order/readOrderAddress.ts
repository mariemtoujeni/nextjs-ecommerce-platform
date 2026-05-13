import { OrderAddress, UserRoles } from "../../../models";
import { ErrorCodes, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const readOrderAdressUseCase = async (orderId: number): Promise<OrderAddress[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const orderAddressRepository = await getInjection("IOrderRepository");
    const orderAddress = await orderAddressRepository.readOrderAddress(orderId);
    return orderAddress;
}