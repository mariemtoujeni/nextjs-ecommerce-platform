import { AddAdminRequest, addAdminSchema, Admin, NewAdmin, SignUpRequest, UserRoles } from "../../models";
import { BadRequestError, getInjection } from "../../types";
import { UnauthorizedError, ErrorCodes } from "../../types/error";


export const createAdminRoleUseCase = async (request: AddAdminRequest, userToCreate: SignUpRequest, timestamp: string): Promise<Admin> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN]);
    
    const validatedFields = addAdminSchema.safeParse({
        ...request
    })
    if (!validatedFields.success) {
        throw new BadRequestError(validatedFields.error.message);
    }

    const newAdmin : NewAdmin = {
        prenom: request.prenom,
        nom: request.nom,
        email: request.email,
        role: request.role
    }

    const accessSetting = await getInjection("IAccessSettingRepository");
    const newAccessSetting = await accessSetting.create(newAdmin, userToCreate, timestamp);

    const emailService = await getInjection("IEmailService");
    const emailResponse = await emailService.sendInvitationEmail(userToCreate.email, `${timestamp}`);
    if(!emailResponse.success) {
        throw new Error(`Erreur lors de l'envoi de l'email d'invitation : ${emailResponse.message}, l'email ${userToCreate.email} a été ajouté avec succès avec le mot de passe ${userToCreate.password} mais l'email d'invitation n'a pas pu être envoyé`) ;
    }

    return newAccessSetting;
}