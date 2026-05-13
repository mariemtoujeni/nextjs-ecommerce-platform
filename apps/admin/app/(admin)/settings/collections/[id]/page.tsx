import { CollectionDetail } from "@repo/core/usecases";
import { MainPanelComponent } from "./main-panel-component";
import { getAllProductAction } from "@repo/actions/products";
import { getCollectionAction } from "@repo/actions/collections";
import { ReturnAll, ReturnOne } from "@repo/core/types";
import { ProductWithAdmin } from "@repo/core/models";

export type Props = {
    params: Promise<{ id: string }>;
}

export default async function CollectionManager(props: Props) {
    const { id } = await props.params;
    const collection : ReturnOne<CollectionDetail> = await getCollectionAction(Number(id));
    const products : ReturnAll<ProductWithAdmin> = await getAllProductAction();
    return <MainPanelComponent collection={collection} products={products}/>
}