import { Event, EventFilter, EventInput } from "../models";
import { ReturnAll } from "../types";


export interface IEventRepository {
    read(options: EventFilter): Promise<ReturnAll<Event>>;
    readById(id: number): Promise<Event>;
    createEvent(event: EventInput): Promise<Event>;
    updateEvent(even: Event): Promise<Event>;
    deleteEvent(id: number): Promise<void>;
    readPublishedEvents(): Promise<Event[]>;
}