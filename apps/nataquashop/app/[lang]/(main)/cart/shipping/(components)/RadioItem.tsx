"use client"

import { updateDeliveryCartAction } from "@repo/actions/cart"
import { OrderDeliveryMode } from "@repo/core/models"
import { startTransition } from "react"
import { RadioGroupItem } from "~/components/ui"
import { useDeliveryPrice } from "./DeliveryPriceContext"

type Props = {
  value: string
  id: string
}

export const RadioItemComponent: React.FC<Props> = ({ value, id }: Props) => {
  const { refreshDeliveryCart } = useDeliveryPrice();
  const handleClick = () => {
    startTransition(async () => {
      if (value === "standard") {
        await updateDeliveryCartAction({ deliveryMode: OrderDeliveryMode.SO_COLISSIMO })
      } else if (value === "express") {
        await updateDeliveryCartAction({ deliveryMode: OrderDeliveryMode.CHRONOPOST })
      }
      await refreshDeliveryCart();
    })
  }

  return (
    <RadioGroupItem value={value} id={id} onClick={handleClick}/>
  )
}
