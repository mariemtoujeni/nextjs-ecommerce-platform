import { DeliveryCart, OrderDeliveryMode } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const getDeliveryCartUseCase = async (): Promise<DeliveryCart> => {
    const cartRepository = await getInjection("ICartRepository");
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    
    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const deliveryCart = await cartRepository.getDeliveryCartbyId(user.id);
    const customerCart = await cartRepository.getCustomerCart(user.id);
    const totalWeight = customerCart.reduce((sum, item) => {
            return sum + (item.model.weight * item.quantity);
        }, 0);
    if (!deliveryCart) {
        const clientRepository = await getInjection("IClientRepository");
        const client = await clientRepository.read(user.id);
        const clientAddresses = client.clientAddress;
        const defaultAddress = clientAddresses.find(addr => addr.default === true);
        if (!defaultAddress) {
            throw new Error("No default address found");
        }

        const createdDeliveryCart = await cartRepository.addDeliveryCart({
            userId: user.id,
            deliveryMode: OrderDeliveryMode.MONDIAL_RELAY,
            billingAddressId: defaultAddress.id,
            relaisId: "",
            weight: totalWeight,
            prix: 0,
            company: defaultAddress.societe,
            lastName: defaultAddress.nom,
            firstName: defaultAddress.prenom,
            adress: defaultAddress.adresse,
            adress2: defaultAddress.adresse2,
            adress3: defaultAddress.adresse3,
            postCode: defaultAddress.code_postal,
            city: defaultAddress.ville,
            country: defaultAddress.pays,
            clientAddressId: defaultAddress.id,
            valid: false,
        });    
        const updatedResult = await cartRepository.updateDeliveryPriceForCart(createdDeliveryCart);    

        return updatedResult;
    }
    if (deliveryCart.weight !== totalWeight) {
        //update the total weight
        const updatedDeliveryCart = await cartRepository.updateDeliveryCart({
            userId: deliveryCart.userId,
            deliveryMode: deliveryCart.deliveryMode,
            billingAddressId: deliveryCart.billingAddressId,
            relaisId: deliveryCart.relaisId,
            weight: totalWeight,
            prix: deliveryCart.prix,
            company: deliveryCart.company,
            lastName: deliveryCart.lastName,
            firstName: deliveryCart.firstName,
            adress: deliveryCart.adress,
            adress2: deliveryCart.adress2,
            adress3: deliveryCart.adress3,
            postCode: deliveryCart.postCode,
            city: deliveryCart.city,
            country: deliveryCart.country,
            valid: deliveryCart.valid
        }); 
        //update delivery price
        const updatedResult = await cartRepository.updateDeliveryPriceForCart(updatedDeliveryCart);    

        return updatedResult;
    }
    return deliveryCart;
}