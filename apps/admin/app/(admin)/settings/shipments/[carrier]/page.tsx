import { HeaderComponent } from "./headerComponent";
import { Country, Shipment } from "@repo/core/models";
import { getShippingConfAction, getCountriesWithoutZoneAction } from "@repo/actions/shipping-manager";
import { Zone } from "./zoneCompnent";

export type Props = {
    params: Promise<{ carrier: string }>;
}

export default async function DetailProviderConfPage(props: Props) { 
    const { carrier } = await props.params;
    const shipping : Shipment[] = await getShippingConfAction(carrier);
    const countriesWithoutZone : Country[]  = await getCountriesWithoutZoneAction(carrier);

    return (
        <div className="container h-[calc(100vh-80px)]">
            <HeaderComponent expediteur={carrier}/>
            <div className="grid grid-cols-2 gap-4 mt-12">
                {
                    shipping.map((p_provider: Shipment, index) => <Zone key={index} expediteur={p_provider} providerName={carrier} countriesWithoutZone={countriesWithoutZone}/>)
                }
            </div>
        </div>
    )
}