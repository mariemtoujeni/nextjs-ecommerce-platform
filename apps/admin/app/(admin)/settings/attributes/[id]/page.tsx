import { getAttributeAction } from "@repo/actions/attributes";
import { MainComponent } from "./(component)/MainComponent";
export type Props = {
    params: Promise<{ id: string }>;
}

export default async function DetailAttributePage(props: Props) { 
    const { id } = await props.params;    
    return <MainComponent id={parseInt(id)} />
}