import { getAllProductModelsAction } from "@repo/actions/product-models";
import { CreateCheckoutComponent } from "./create-checkout";
import { getAllClientAction } from "@repo/actions/clients";
import { ClientFilterTypeAdmin, ClientType } from "@repo/core/models";
import { listShopsAction } from "@repo/actions/orders";

export default async function CheckoutNewPage() {
    const products = await getAllProductModelsAction({sort: 'asc'});    
    const clients = await getAllClientAction({sort: 'asc' , filters: [ { key: ClientFilterTypeAdmin.TYPE, values: [ClientType.CLIENT], }, ]});
    const clubs = await getAllClientAction({sort: 'asc', filters: [ { key: ClientFilterTypeAdmin.TYPE, values: [ClientType.CLUB], }, ]});
    const shops = await listShopsAction(true);
    return (
        <div className="w-full">
            <CreateCheckoutComponent products={products} clients={clients} clubs={clubs} shops={shops} />
        </div>
    );
}