import { SearchParams } from "@repo/core/types";
import { getAdminPurchaseOrderFilters, listPurchaseOrdersAction } from "@repo/actions/orders";
import { ListSupplierOrdersView } from "./listSupplierOrders";
import { HeaderComponent } from "./(common)/heading-component";

export default async function SupplierOrdersPage({ searchParams } : { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const filters = await getAdminPurchaseOrderFilters();
    const purchaseOrders = await listPurchaseOrdersAction({limit: 100, offset: 0, sort: "desc", search: ""});

    return (
        <div className="container">
            <HeaderComponent state="list"  />
            <ListSupplierOrdersView purchaseOrders={purchaseOrders} filters={filters} page={page ? parseInt(page) : 1} />
        </div>
    );
}