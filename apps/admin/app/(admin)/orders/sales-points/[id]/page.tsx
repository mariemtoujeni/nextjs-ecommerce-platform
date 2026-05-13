import { getShopAction } from "@repo/actions/orders";
import { MainPanelComponent } from "./main-panel-component";
import { getAllProductModelsAction } from "@repo/actions/product-models";

export type Props = {
    params: Promise<{ id: string }>;
}

export default async function SalesPointsPage(props: Props) {
    const { id } = await props.params;
    const shop = await getShopAction(Number(id));
    const products = await getAllProductModelsAction({sort: 'asc'});                
    return <MainPanelComponent shop={shop} products={products ?? undefined}/>;
}