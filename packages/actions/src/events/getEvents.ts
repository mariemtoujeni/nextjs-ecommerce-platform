"use server"

import { EventFilterInput } from "@repo/core/models";
import { listAllEventsUseCase } from "@repo/core/usecases";

export const getEventsAction = async (options?: EventFilterInput) => {
    try {
        const events = await listAllEventsUseCase(options);
        return {
            items: events.items,
            count: events.count,
            total: events.total
        }
    } catch (error: any) {
        throw error;
    }
}

