import { Model, UserRoles } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const readModelsByIdsUseCase = async (ids: number[]): Promise<Model[]> => {
    const authService = await getInjection("IAuthenticationService")
    const user = await authService.getUser()

    if(!user) {
        throw new UnauthorizedError("User not found");
    }
    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN])

    const modelRepository = await getInjection("IModelRepository");
    return modelRepository.readModelsByIds(ids);
}