import { Admin, UpdateAdminRequest } from "../../models";
import { getInjection } from "../../types";

export const updateAdminRoleUseCase = async (request: UpdateAdminRequest): Promise<Admin> => {
    const accessSetting = await getInjection("IAccessSettingRepository");

    const newAccessSetting = await accessSetting.update({
        ...request,
        id: request.id,
        prenom: request.prenom,
        nom: request.nom,
        email: request.email,
        role: request.role,
        created_at: new Date().toISOString(),
    });

    return newAccessSetting;
}