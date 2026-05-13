import { ICarrier } from "../ICarrier";
import { DeliveryMode } from "./Carrier";
import { Colissimo } from "./Colissimo";
import { MondialRelay } from "./MondialRelay";
import { Environment } from "../../types/utils";

export const processMap: Record<string, (env: Environment) => ICarrier> = {
    [DeliveryMode.MONDIAL_RELAY]: (env: Environment) => new MondialRelay(env)
    , [DeliveryMode.SO_COLISSIMO]: (env: Environment) => new Colissimo(env)
    , [DeliveryMode.COLISSIMO]: (env: Environment) => new Colissimo(env)
}