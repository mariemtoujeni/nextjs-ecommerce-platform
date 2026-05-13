"use server"
import { Event } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { getPublishedEventUseCase } from "@repo/core/usecases";
export const getPublishedEventsAction = async (): Promise<ReturnAll<Event>> => {
       try {
              const events = await getPublishedEventUseCase();
              return {
                     items: events,
                     count: events.length,
                     total: events.length
              };

       } catch (error: any) {
              return {
                     items: [],
                     count: 0,
                     total: 0,
                     error: error
              };
       }
}
