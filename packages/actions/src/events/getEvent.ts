"use server"

import { getEventByIdUseCase } from "@repo/core/usecases";
import { Event } from "@repo/core/models"

export const getEventAction = async (id: number): Promise<Event> => {    
    const event = await getEventByIdUseCase(id);
    return event;
}