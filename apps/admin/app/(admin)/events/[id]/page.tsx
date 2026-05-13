import { getEventAction } from "@repo/actions/events";
import { MainComponent } from "./(component)/MainComponent";
export type Props = {
    params: Promise<{ id: string }>;
}

export default async function DetailEventPage({ params }: Props) { 
    const { id } = await params;
    const event = await getEventAction(parseInt(id));
    return (
            <MainComponent initialEvent={event} />
    );
}
