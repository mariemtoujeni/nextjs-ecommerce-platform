import { getShopAction } from "@repo/actions/orders";
import RestockingPreview from "./restocking-preview-component";

export type Props = {
    params: Promise<{ id: string }>;
};

export default async function RestockingPreviewPage({ params }: Props) {
    const { id } = await params;
    const shopId = parseInt(id);

    const shopResponse = await getShopAction(shopId);
    return <RestockingPreview shop={shopResponse} />;
}