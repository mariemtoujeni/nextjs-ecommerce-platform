import { getInjection } from "../../types";

export const deleteAdminUseCase = async (id: string, email: string): Promise<void> => {
    const accessSetting = await getInjection("IAccessSettingRepository");

    await accessSetting.delete(id, email);
}