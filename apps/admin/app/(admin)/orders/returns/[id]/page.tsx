import { MainPanelComponent } from "./main-panel-component";

export type Props = {
    params: Promise<{ id: string }>;
}

export default async function ReturnPage(props: Props) {
    const { id } = await props.params;
    return <MainPanelComponent returnId={Number(id)} />;
}