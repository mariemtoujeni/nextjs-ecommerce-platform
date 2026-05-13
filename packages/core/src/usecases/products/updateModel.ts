import { getInjection } from "../../types/di";
import { ModelUpdate } from "../../models/Model";
import { UserRoles } from "../../models/User";
import { UnauthorizedError } from "../../types/error";

export const updateModel = async (modelId: number, update: ModelUpdate) => {
    const authService = await getInjection("IAuthenticationService")
    const user = await authService.getUser()

    if(!user) {
        throw new UnauthorizedError("User not found");
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN])

    const modelRepository = await getInjection("IModelRepository")
    await modelRepository.update(modelId, update)
}