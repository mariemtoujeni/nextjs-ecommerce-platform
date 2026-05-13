import { getOrderAdminAction } from "@repo/actions/orders";
import Edit from "./edit";

export type Props = {
    params: Promise<{ id: string }>;
}

export default async function EditOrderPage(props: Props) {
    const { id } = await props.params;    

    const order = await getOrderAdminAction(Number(id));    
    
    return <Edit order={order} /> 
}