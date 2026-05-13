'use client'
import React from "react";
import { CartRelayDialog } from "./CartRelayDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { RadioGroup } from "~/components/ui/radio-group";
import { MapPin, Home, Store } from "lucide-react";
import { Heading } from "~/components/ui/heading";
import { DeliveryCart, OrderDeliveryMode } from "@repo/core/models";
import { RelayAddressDisplay } from "./(components)/RelayRow";
import { RadioItemComponent } from "./(components)/RadioItem";
import DeliveryCartAddressWrapper from "./(components)/CartAddressSelect";
import { ShippingTabsWrapper, useShipping } from "./ShippingTabsWrapper";
import { useDeliveryPrice } from "./(components)/DeliveryPriceContext";
import { RelayHeading } from "./(components)/RelayHeading";
import { ValidationProvider } from "~/components/cart/ValidationContext";

type CartShippingTableProps = {
  deliveryCart: DeliveryCart;
  dict: any;
};

function CartShippingTableContent({ deliveryCart, dict }: CartShippingTableProps) {
  const { refreshDeliveryCart } = useDeliveryPrice();
  let handleDeliveryModeChange: (mode: OrderDeliveryMode, price?: number) => void = () => {};
  let isUpdating = false;

  try {
    const shipping = useShipping();
    handleDeliveryModeChange = shipping.handleDeliveryModeChange;
    isUpdating = shipping.isUpdating;
  } catch (e) {
    console.error("useShipping failed:", e);
  }

  const storeAddress = {
    name: "Nataquashop",
    street: "3 rue du grand coin",
    city: "85100 Les Sables d'Olonne, FR",
  };

  const getCurrentTab = () => {
    switch (deliveryCart.deliveryMode) {
      case OrderDeliveryMode.MONDIAL_RELAY:
        return "relay";
      case OrderDeliveryMode.SO_COLISSIMO:
        return "home";
      case OrderDeliveryMode.AU_MAGASIN:
        return "store";
      default:
        return "relay";
    }
  };

  const currentTab = getCurrentTab();

  const handleTabChange = async (value: string) => {
    if (isUpdating) return;

    let mode: OrderDeliveryMode;
    let price: number | undefined;

    switch (value) {
      case "relay":
        mode = OrderDeliveryMode.MONDIAL_RELAY;
        break;
      case "home":
        mode = OrderDeliveryMode.SO_COLISSIMO;
        break;
      case "store":
        mode = OrderDeliveryMode.AU_MAGASIN;
        break;
      default:
        return;
    }

    handleDeliveryModeChange(mode, price);
    await refreshDeliveryCart(); 
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="border border-border w-full md:max-w-3xl mb-4" >
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="relay" className="flex flex-col items-center gap-1" disabled={isUpdating} >
          <MapPin size={20} />
          {dict.cart.shipping.relayPoint.title}
        </TabsTrigger>
        <TabsTrigger value="home" className="flex flex-col items-center gap-1" disabled={isUpdating} >
          <Home size={20} />
          {dict.cart.shipping.home.title}
        </TabsTrigger>
        <TabsTrigger value="store" className="flex flex-col items-center gap-1" disabled={isUpdating} >
          <Store size={20} />
          {dict.cart.shipping.store.title}
        </TabsTrigger>
      </TabsList>

      {/* Relay Point Tab */}
      <TabsContent value="relay">
        <input type="hidden" id="relay-point-id" value={deliveryCart.relaisId} />
        <div className="flex flex-col items-start">
          <div className="flex items-center justify-between w-full p-6 border-b border-border">
            <div>
              <RelayHeading
                title={dict.cart.shipping.relayPoint.title}
                validationText={dict.cart.shipping.relayPoint.validation}
              />
              <RelayAddressDisplay deliveryCart={deliveryCart} />
            </div>
            <CartRelayDialog dict={dict} />
          </div>
          <DeliveryCartAddressWrapper initialDeliveryCart={deliveryCart} dict={dict} />
        </div>
      </TabsContent>

      {/* Home Delivery Tab */}
      <TabsContent value="home">
        <div className="flex flex-col">
          <div className="flex flex-col w-full p-6 border-b border-border gap-4">
            <DeliveryCartAddressWrapper initialDeliveryCart={deliveryCart} dict={dict} delivery={true}/>
            <RadioGroup defaultValue="standard" className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioItemComponent value={"standard"} id={"standard"} />
                <label htmlFor="standard" className="text-sm">
                  {dict.cart.shipping.home.shippingOptions.standard}
                  <span className="text-gray-500 ml-1">(environ 2 jours)</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioItemComponent value={"express"} id={"express"} />
                <label htmlFor="express" className="text-sm">
                  {dict.cart.shipping.home.shippingOptions.express}
                  <span className="text-gray-500 ml-1">(moins de 24h)</span>
                </label>
              </div>
            </RadioGroup>
          </div>
          <DeliveryCartAddressWrapper initialDeliveryCart={deliveryCart} dict={dict} />
        </div>
      </TabsContent>

      {/* Store Pickup Tab */}
      <TabsContent value="store">
        <div className="flex flex-col">
          <div className="flex flex-col w-full p-6 border-b border-border gap-1">
            <Heading heading="6">{storeAddress.name}</Heading>
            <div className="text-md text-neutral-500">
              {storeAddress.street}
            </div>
            <div className="text-md text-neutral-500">
              {storeAddress.city}
            </div>
          </div>
          <DeliveryCartAddressWrapper initialDeliveryCart={deliveryCart} dict={dict} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function CartShippingTable({ deliveryCart, dict }: CartShippingTableProps) {
  const getCurrentTab = () => {
    switch (deliveryCart.deliveryMode) {
      case OrderDeliveryMode.MONDIAL_RELAY:
        return "relay";
      case OrderDeliveryMode.SO_COLISSIMO:
        return "home";
      case OrderDeliveryMode.AU_MAGASIN:
        return "store";
      default:
        return "relay";
    }
  };

  const currentTab = getCurrentTab();

  return (
    <ShippingTabsWrapper currentTab={currentTab} deliveryCart={deliveryCart}>
      <CartShippingTableContent deliveryCart={deliveryCart} dict={dict} />
    </ShippingTabsWrapper>
  );
}