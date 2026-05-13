'use client';

import { DeliveryCart } from "@repo/core/models";
import React, { useState, useEffect } from "react";
import { relayEventBus } from "~/lib/relay-event-bus";

export interface RelayData {
  Adresse1: string;
  Adresse2: string;
  Available: boolean;
  CP: string;
  HoursHtmlTable: string;
  ID: string;
  Lat: string;
  Long: string;
  Nature: string;
  Nom: string;
  Pays: string;
  Ville: string;
  Photo: string | null;
  Warning: string;
  Letter?: string;
}

interface RelayAddressDisplayProps {
  deliveryCart: DeliveryCart;
}

// const PROD_ORIGINS = [
//   "https://nataquashop.com",
//   "https://dev.nataquashop.com",
// ];

// export const ALLOWED_ORIGINS = process.env.NODE_ENV === "production" ? PROD_ORIGINS : ["*"];

export function RelayAddressDisplay({ deliveryCart }: RelayAddressDisplayProps) {
  const [dataSelected, setDataSelected] = useState<RelayData | null>(null);

  useEffect(() => {
    const handleParcelShopMessage = (event: MessageEvent) => {
      // if (!ALLOWED_ORIGINS.includes(event.origin) && ALLOWED_ORIGINS[0] !== "*") {
      //   console.error("Rejected message from origin:", event.origin);
      //   return;
      // }
      if (event.data?.type === "parcelshop-selected") {
        relayEventBus.publish(event.data.dataSelected);
        setDataSelected(event.data.dataSelected);
      }
    };

    window.addEventListener("message", handleParcelShopMessage);
    return () => {
      window.removeEventListener("message", handleParcelShopMessage);
    };
  }, []);

  if (!dataSelected) return null;

  return (
    <>
      <div className="text-md text-neutral-500">{dataSelected.Adresse1}</div>
      <div className="text-md text-neutral-500">
        {dataSelected.CP} {dataSelected.Ville}, {dataSelected.Pays}
      </div>
    </>
  );
}
