import { RelayData } from "~/app/[lang]/(main)/cart/shipping/(components)/RelayRow"

type Listener = (data: RelayData) => void

let listener: Listener | null = null

export const relayEventBus = {
  subscribe(cb: Listener) {
    listener = cb
  },
  unsubscribe() {
    listener = null
  },
  publish(data: RelayData) {
    if (listener) listener(data)
  },
}
