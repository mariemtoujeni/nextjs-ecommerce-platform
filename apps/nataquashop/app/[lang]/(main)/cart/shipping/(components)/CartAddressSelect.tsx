import { Heading } from "~/components/ui";
import { CartAddressDialog } from "./CartAddressDialog";
import { DeliveryCart } from "@repo/core/models";

interface DeliveryCartAddressWrapperProps {
  initialDeliveryCart: DeliveryCart;
  dict: any;
  delivery?: boolean;
}
      
export default function DeliveryCartAddressWrapper({ initialDeliveryCart, dict, delivery }: DeliveryCartAddressWrapperProps) {
  const billingAddr = initialDeliveryCart.billingAddress.find(
    (addr) => addr.id === initialDeliveryCart.billingAddressId
  );

  return (
    <div className={`flex items-center justify-between w-full ${delivery ? '' : 'p-6'}`} >
      <div>
        <Heading heading="6">
          {delivery ? `${dict.cart.shipping.home.deliveryAddress}` : `${dict.cart.shipping.home.billingAddress}`}
        </Heading>
        <div className="text-md text-neutral-500">
          {initialDeliveryCart.firstName} {initialDeliveryCart.lastName}
        </div>
        <div className="text-md text-neutral-500">
          {billingAddr ? billingAddr.adresse : "Adresse non définie"}
        </div>
        <div className="text-md text-neutral-500">
          {billingAddr ? `${billingAddr.code_postal} ${billingAddr.ville}, ${billingAddr.pays}` : ""}
        </div>
      </div>
      <CartAddressDialog
        dict={dict}
        deliveryCart={initialDeliveryCart}
      />
    </div>
  );
}
