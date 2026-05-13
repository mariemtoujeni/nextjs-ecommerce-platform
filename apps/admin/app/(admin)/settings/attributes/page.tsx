import { ListAttributes } from "./list-attribues";
import { getAttributesAction } from "@repo/actions/attributes";

export default async function Attributes() {
    const attributes = await getAttributesAction();

    return <div className="container h-[calc(100vh-80px)]">                
        <ListAttributes attributes={attributes} />
    </div>
}