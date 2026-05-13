import { getSupplierOrderAction } from "@repo/actions/orders";
import { ClientWrapper } from "./client-wrapper";

export type Props = {
    params: Promise<{ id: string }>;
};

export default async function ReceivePage(props: Props) {
    const { id } = await props.params;
    const purchaseOrder = await getSupplierOrderAction(id);
    return <ClientWrapper purchaseOrder={purchaseOrder} />;
}