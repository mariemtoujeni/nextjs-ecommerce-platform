import { IEventRepository } from "../../repositories";
import { Event } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { ReturnAll } from '../../types/utils';

export class MockEventRepository implements IEventRepository {
   async readPublishedEvents(): Promise<Event[]> {
        const publishedEvents = SharedMemory.events.filter(event => event.status === 1);
        return publishedEvents;
    }

    async createEvent(event: Event): Promise<Event> {
        SharedMemory.events.push(event);
        return event;
    }

    async updateEvent(event: Event): Promise<Event> {
        const index = SharedMemory.events.findIndex(e => e.id === event.id);
        if (index === -1) {
            throw new Error("Event not found");
        }
        SharedMemory.events[index] = event;
        return event;
    }

    async deleteEvent(id: number): Promise<void> {
        const index = SharedMemory.events.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error("Event not found");
        }
        SharedMemory.events.splice(index, 1);
    }

    async readById(id: number): Promise<Event> {
        const event = SharedMemory.events.find(event => event.id === id);
        if (!event) {
            throw new InternalServerError('Event not found');
        }
        return event;
    }

    async read(): Promise<ReturnAll<Event>> {
        return {
            count: SharedMemory.events.length,
            total: SharedMemory.events.length,
            items: SharedMemory.events,
        };
    }

    async readActiveEvents(): Promise<ReturnAll<Event>> {
        const activeEvents = SharedMemory.events.filter(event => event.status === 1);

        return {
            count: activeEvents.length,
            total: SharedMemory.events.length,
            items: activeEvents,
        };
    }

}
