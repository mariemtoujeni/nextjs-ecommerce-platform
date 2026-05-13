import { BadRequestError } from "../../types/error";
import { Event, EventFilterInput, eventOptionsSchema } from "../../models";
import { ReturnAll } from "../../types/utils";
import { getInjection } from "../../types/di";

export const listAllEventsUseCase = async (options?: EventFilterInput): Promise<ReturnAll<Event>> => {
    const validatedOptions = eventOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const eventRepository = await getInjection('IEventRepository');

    const events = await eventRepository.read(validatedOptions.data);
    
    return events;
}