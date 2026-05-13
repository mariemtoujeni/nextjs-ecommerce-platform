import { OrderAddressInput, UserRoles, OrderAddressSchema, OrderAddress } from "../../../models";
import { ErrorCodes, UnauthorizedError } from "../../../types";
import { getInjection } from "../../../types";

export const createOrderAdressUseCase = async (orderAddressInput: OrderAddressInput): Promise<OrderAddress> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }

    const validatedOrderAddress = OrderAddressSchema.parse(orderAddressInput);

    const orderAddress: OrderAddress = {
        ...validatedOrderAddress,
        relaisId: validatedOrderAddress.relaisId ?? "",
        company: validatedOrderAddress.company ?? "",
        lastName: validatedOrderAddress.lastName ?? "",
        firstName: validatedOrderAddress.firstName ?? "",
        address: validatedOrderAddress.address ?? "",
        address2: validatedOrderAddress.address2 ?? "",
        address3: validatedOrderAddress.address3 ?? "",
        postCode: validatedOrderAddress.postCode ?? "",
        city: validatedOrderAddress.city ?? "",
        country: validatedOrderAddress.country ?? ""
    };

    const orderAddressRepository = await getInjection("IOrderRepository");
    const createdOrderAddress = await orderAddressRepository.createOrderAddress(orderAddress);
    return createdOrderAddress;
}