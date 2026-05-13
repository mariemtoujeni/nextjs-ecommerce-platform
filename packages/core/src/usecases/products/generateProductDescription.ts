import { getInjection, UnauthorizedError } from "../../types";
import { Product, UserRoles } from "../../models";
import { ChatGPTResponse } from "../../services";

export const generateProductDescriptionUseCase = async (threadId: string,product: Product) : Promise<ChatGPTResponse[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("Unauthorized access to resources for user");
    }

    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const storageService = await getInjection("IAIAssistantService");
    const description = await storageService.generateDescription(threadId, product);
    return description;
}