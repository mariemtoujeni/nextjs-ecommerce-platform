import { UserRoles } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const createThreadId = async () => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("Unauthorized access to resources for user");
    }

    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const chatGPTService = await getInjection("IAIAssistantService");
    const threadId = await chatGPTService.createThread();
    return threadId;
}