import { Event } from "../../models";
import { getInjection } from "../../types";

export const getPublishedEventUseCase = async (): Promise<Event[]> => {
    const eventRepository = await getInjection('IEventRepository');
    const events = await eventRepository.readPublishedEvents();
    return events;
}