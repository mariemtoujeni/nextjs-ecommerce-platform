import { AttributDetail } from "../../models";
import { getInjection } from "../../types";
import { UnauthorizedError, ErrorCodes } from "../../types/error";
import { UserRoles } from "../../models";

export const deleteAttributeUseCase = async (attribut: AttributDetail): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const attributeRepository = await getInjection("IAttributRepository");

    // Delete all entries in the filtre_attributs table for the attribute
    await attributeRepository.deleteFilterAttributesByValueIds(attribut.values.map(value => value.id));

    // Delete all values for the attribute
    await attributeRepository.deleteAttributeValues(attribut.values.map(value => value.id));

    // Delete all entries in the filtre table for the attribute
    await attributeRepository.deleteFilters(attribut.filters.map(filter => filter.id));

    // Delete the attribute
    await attributeRepository.deleteAttribute(attribut.id);
}
