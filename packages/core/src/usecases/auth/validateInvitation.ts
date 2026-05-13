import { BadRequestError, UnauthorizedError } from "../../types/error";
import { User, ValidateInvitation } from "../../models";
import { getInjection } from "../../types/di";

export const validateInvitationUseCase = async (validateInvitation: ValidateInvitation): Promise<User> => {
    if (validateInvitation.password !== validateInvitation.confirmPassword) {
        throw new BadRequestError("Password and confirm password do not match");
    }

    // code is a timestamp
    const codeDate = new Date(validateInvitation.code);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - codeDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours > 72) {
        throw new BadRequestError("Code d'invitation a expiré");
    }

    const accessSettingService = await getInjection("IAccessSettingRepository");
    const accessSetting = await accessSettingService.readByValidInvitationCode(validateInvitation.code);
    if (!accessSetting) {
        throw new UnauthorizedError("Code d'invitation not found");
    }
    await accessSettingService.updatePassword(accessSetting.id, validateInvitation.password);

    const authService = await getInjection('IAuthenticationService');
    const user = await authService.signIn(accessSetting.email, validateInvitation.password);
    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    if(!user.user_role.includes("admin")) {
        throw new UnauthorizedError("User is not an admin");
    }
    return user;
}