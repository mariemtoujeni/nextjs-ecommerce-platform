import { getSuppliersAction } from "@repo/actions/supplier";
import { getAllProductModels2Action } from "@repo/actions/product-models";
import { MainPanelComponent } from "./main-panel-component";

export default async function NewSupplierOrderPage() {
    const suppliers = await getSuppliersAction({
        limit: 20,
        offset: 0,
        sort: 'asc'
    });
    const products = await getAllProductModels2Action({
        options: {sort: 'asc'},
        modelIds: [],
        flag: 'purchase-order'
    });
    return <MainPanelComponent suppliers={suppliers} products={products} />;    
}