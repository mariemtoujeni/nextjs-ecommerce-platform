import { getInjection, UnauthorizedError } from "../../types";
import { Product, UserRoles } from "../../models";

export const generateTrainingDataUseCase = async () => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("Unauthorized access to resources for user");
    }

    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const productRepository = await getInjection("IProductRepository");
    const products : Product[] = await productRepository.readAll();

    const storageService = await getInjection("IAIAssistantService");
    const trainingData = await storageService.trainAssistant(products);
    return trainingData;
}