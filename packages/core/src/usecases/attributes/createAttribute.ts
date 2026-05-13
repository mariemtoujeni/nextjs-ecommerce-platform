import { Attribut, CreateAttributDetailRequest, AttributFilter } from "../../models";
import { getInjection } from "../../types";
import { UnauthorizedError, ErrorCodes } from "../../types/error";
import { UserRoles } from "../../models";

export const createAttributeUseCase = async (attribute: CreateAttributDetailRequest): Promise<Attribut> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const attributeRepository = await getInjection("IAttributRepository");
    const createdAttribute = await attributeRepository.createAttribute({
        nom: attribute.name,
        legende: attribute.legend
    });
    if (!createdAttribute) {
        throw new Error("Attribute not created");
    }

    const createdFilters: AttributFilter[] = [];
    for (const filter of attribute.filters) {
        const createdFilter = await attributeRepository.createFilter({
            id_attribut: createdAttribute.id,
            nom: filter.nom,
            couleur: filter.couleur
        });        
        createdFilters.push(createdFilter);
    }

    for (const value of attribute.values) {
        const createdAttributeValue = await attributeRepository.createAttributeValue({
            id_attribut: createdAttribute.id,
            nom: value.nom
        });

        // use the array createdFilters to get the id of the filter        
        const linkedFilters = createdFilters.filter((f) => value.linkedFilters.some((filter) => filter.nom === f.nom && filter.couleur === f.couleur));
        if(linkedFilters.length > 0) {
            for(const f of linkedFilters) {
                await attributeRepository.createFilterAttribute({
                    id_filtre: f.id,
                    id_attribut: createdAttributeValue.id
                });
            }
        }
    }
    return createdAttribute;
}