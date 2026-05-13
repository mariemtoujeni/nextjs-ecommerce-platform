'use client'

import { updateDeliveryCartAction } from "@repo/actions/cart"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui"
import { relayEventBus } from "~/lib/relay-event-bus"
import { RelayData } from "./RelayRow"
import { DialogClose } from "~/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useValidation } from "~/components/cart/ValidationContext"

interface Props {
  dict: any;
}
export function SelectButton({dict}: Props) {
  const [relayData, setRelayData] = useState<RelayData | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { clearRelayError } = useValidation(); // 👈 consume context

  useEffect(() => {
    relayEventBus.subscribe(setRelayData)
    return () => relayEventBus.unsubscribe()
  }, [])

  const handleClick = async () => {
    if (!relayData) return
    setLoading(true)

    try {
      await updateDeliveryCartAction({
        country: relayData.Pays,
        relaisId: relayData.ID,
        adress: relayData.Adresse1,
        city: relayData.Ville,
        postCode: relayData.CP,
      })

      clearRelayError(); // 👈 clear the validation error when selection is saved
      router.refresh();
    } catch (err) {
      console.error("Update failed", err)
      setLoading(false)
      return
    }

    // close modal
    const dialogCloseBtn = document.getElementById("dialog-close-trigger")
    dialogCloseBtn?.click()
  }

  return (
    <>
      <DialogClose asChild>
        <button id="dialog-close-trigger" className="hidden" />
      </DialogClose>

      <Button
        variant="default"
        onClick={handleClick}
        disabled={!relayData || loading}
      >
        {loading
          ? `${dict.cart.shipping.relayPoint.select}...`
          : `${dict.cart.shipping.relayPoint.select}`}
      </Button>
    </>
  )
}
