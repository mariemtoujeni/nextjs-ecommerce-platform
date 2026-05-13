import { getSupplierOrderAction } from "@repo/actions/orders";
import { getSuppliersAction } from "@repo/actions/supplier";
import { getAllProductModels2Action } from "@repo/actions/product-models";
import { MainPanelComponent } from "./main-panel-component";

export type Props = {
    params: Promise<{ id: string }>;
};

export default async function SupplierOrderPage(props: Props) {
    const { id } = await props.params;
    const purchaseOrder = await getSupplierOrderAction(id);
    const suppliers = await getSuppliersAction({
        limit: 20,
        offset: 0,
        sort: 'asc'
    });
    const products = await getAllProductModels2Action({
        options: {sort: 'asc'},
        modelIds: [],
        brandId: purchaseOrder.item?.supplierId,
        flag: 'purchase-order'
    });
    return <MainPanelComponent purchaseOrder={purchaseOrder} suppliers={suppliers} products={products} />
}