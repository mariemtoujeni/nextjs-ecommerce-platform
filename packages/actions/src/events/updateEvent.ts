"use server"

import { updateEventUseCase } from "@repo/core/usecases";
import { Event } from "@repo/core/models";

export const updateEventAction = async (event: Event) => {
    const updatedEvent = await updateEventUseCase(event);
    return updatedEvent;
}