import { Collection } from "@repo/core/models";
import { listCollectionsAction } from "@repo/actions/collections";
import { ListCollectionsView } from "./list-collections";
import { ReturnAll } from "@repo/core/types";
import { HeaderComponent } from "./heading-component";

export default async function CollectionsManager() {
    const collections : ReturnAll<Collection> = await listCollectionsAction();

    return <div className="container">
        <HeaderComponent collections={collections} />
        <ListCollectionsView collections={collections} />
    </div>
}