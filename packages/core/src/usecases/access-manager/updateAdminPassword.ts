import { User } from "../../models";
import { BadRequestError, getInjection } from "../../types";
import { signInUseCase } from "../auth/signIn";

export const updateAdminPasswordUseCase = async (resetPasswordCode: string, password: string): Promise<User> => {
    // check if resetPasswordCode less than 72 hours
    const resetPasswordCodeDate = new Date(resetPasswordCode);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - resetPasswordCodeDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours > 72) {
        throw new BadRequestError("Le code de réinitialisation de mot de passe a expiré");
    }
    const accessSetting = await getInjection("IAccessSettingRepository");
    const adminUser = await accessSetting.updatePassword(resetPasswordCode, password);
    
    const user : User = await signInUseCase({email: adminUser.email, password: password, checkAdmin: true});
    return user;
}