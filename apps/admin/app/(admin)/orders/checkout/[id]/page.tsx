import { getCheckoutAction, listShopsAction } from "@repo/actions/orders";
import { MainPanelComponent } from "./main-panel-component";
import { getAllProductModelsAction } from "@repo/actions/product-models";
import { getAllClientAction } from "@repo/actions/clients";
import { CheckoutStatus, ClientFilterTypeAdmin, ClientType } from "@repo/core/models";
import { AlertTriangle } from "lucide-react";

export type Props = {
    params: Promise<{ id: string }>;
}

export default async function CheckoutPage(props: Props) {
    const { id } = await props.params;
    const checkout = await getCheckoutAction(Number(id));
	if(checkout.error) {
		return (
			<div className="m-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
				<div className="flex items-start gap-3">
					<AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
					<div className="space-y-1">
						<p className="font-medium">Impossible de charger le ticket de caisse</p>
						<p className="text-sm text-red-700">Une erreur s'est produite lors de la récupération des données. 
                            Veuillez réessayer plus tard. <br /> Erreur : {checkout.error}</p>
					</div>
				</div>
			</div>
		);
	} 

    if(checkout.item && checkout.item.status === CheckoutStatus.OPEN) {
        const products = await getAllProductModelsAction({sort: 'asc'});    
        const clients = await getAllClientAction({sort: 'asc' , filters: [ { key: ClientFilterTypeAdmin.TYPE, values: [ClientType.CLIENT], }, ]});
        const clubs = await getAllClientAction({sort: 'asc', filters: [ { key: ClientFilterTypeAdmin.TYPE, values: [ClientType.CLUB], }, ]});
        const shops = await listShopsAction(true);

        return <MainPanelComponent checkout={checkout} products={products} clients={clients} clubs={clubs} shops={shops}/>
    } else {
        return <MainPanelComponent checkout={checkout}/>
    }
}