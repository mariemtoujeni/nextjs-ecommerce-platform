import { Event, UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const updateEventUseCase = async (event: Event): Promise<Event> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    const eventRepository = await getInjection('IEventRepository');

    const updatedEvent = await eventRepository.updateEvent(event);
    return updatedEvent;
}