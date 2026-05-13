import { ICarrier } from "./CarrierInterface.ts";
import { Colissimo } from "./Colissimo.ts";
import { DeliveryMode, Environment } from "./index.ts";
import { MondialRelay } from "./MondialRelay.ts";

export const processMap: Record<string, (env: Environment) => ICarrier > = {
    [DeliveryMode.MONDIAL_RELAY]: (env: Environment) => new MondialRelay(env)
    , [DeliveryMode.SO_COLISSIMO]: (env: Environment) => new Colissimo(env)
    , [DeliveryMode.COLISSIMO]: (env: Environment) => new Colissimo(env)
}