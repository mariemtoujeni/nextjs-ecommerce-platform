import { Admin } from "../../models";
import { getInjection, ReturnAll } from "../../types";

export const listAdminsUseCase = async (): Promise<ReturnAll<Admin>> => {
    const accessSetting = await getInjection("IAccessSettingRepository");

    const accessSettings = await accessSetting.readAll();

    return accessSettings;
}