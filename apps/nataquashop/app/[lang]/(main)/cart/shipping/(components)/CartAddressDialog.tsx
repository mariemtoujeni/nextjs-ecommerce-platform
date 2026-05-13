"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { CartAddressFormDialog } from "./CartAddressFormDialog";
import { addAddressAction, listClientAddressesAction, updateDeliveryCartAction, } from "@repo/actions/cart";
import { Address, AddressFormInput, DeliveryCart, } from "@repo/core/models";
import { useRouter } from "next/navigation";

interface CartAddressDialogProps {
  deliveryCart: DeliveryCart;
  dict: any;
}

export const CartAddressDialog: React.FC<CartAddressDialogProps> = ({ deliveryCart, dict }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const router = useRouter()
  useEffect(() => {
    const fetchAddresses = async () => {
      const B_addresses = await listClientAddressesAction();
      setAddresses(B_addresses.items);
    };

    fetchAddresses();
  }, []);

  async function handleAddressSubmit(address: AddressFormInput) {
    try {
      const result = await addAddressAction({
        designation: "Adresse de Facturation",
        address: address.address,
        complement: address.complement,
        building: address.building,
        postalCode: address.postalCode,
        city: address.city,
        country: "FR",
      });

      setAddresses((prev) => [...prev, result.item]);
    } catch (error) {
      console.error("Error adding address:", error);
    }
  }

  async function handleAddressSelect(address: Address) {
    try {
      const updatedCart = {
        billingAddressId: address.id,
      };

      await updateDeliveryCartAction(updatedCart);
      router.refresh();
    } catch (error) {
      console.error("Error selecting address:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-neutral-500 underline" >
          {dict.cart.shipping.relayPoint.edit}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] md:w-[60%] max-w-2xl p-0">
        {/* Header */}
        <DialogTitle>
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-8 pb-4">
            <Heading heading="5">{dict.cart.shipping.address.title}</Heading>
          </div>
        </DialogTitle>

        {/* Address List */}
        <div className="px-4 md:px-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {addresses.map((address) => (
              <DialogClose asChild key={address.id}>
                <div
                  className="flex flex-col py-4 border-b border-border cursor-pointer hover:bg-accent"
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="text-md">{address.adresse}</div>
                  <div className="text-md">{address.ville}</div>
                  <div className="text-sm text-muted-foreground"> {address.pays} </div>
                </div>
              </DialogClose>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-4 py-4 md:px-8 md:py-8">
          <DialogClose asChild>
            <Button variant="outline">
              {dict.cart.shipping.address.cancel}
            </Button>
          </DialogClose>
          <CartAddressFormDialog onSubmit={handleAddressSubmit} dict={dict} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
