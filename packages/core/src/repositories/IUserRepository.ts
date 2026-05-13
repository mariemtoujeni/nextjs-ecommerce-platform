
import { UserToken } from "../types/utils";
import { NewUserClient, ResetPasswordData, SignUpClub, SignUpPayload, SignUpRequest, SignUpRequestWithoutPassword } from "../models/User";

export interface IUserRepository {
    createUserByAdmin(user: SignUpRequest): Promise<NewUserClient>;
    updateUserByAdmin(user: SignUpRequestWithoutPassword, clientNumber: number): Promise<number>;
    createUser(user: SignUpPayload): Promise<{ success: boolean; error?: string }>;
    createClubUser(user: SignUpClub): Promise<boolean>;
    generateResetPasswordLink(email: string): Promise<ResetPasswordData| null>;
    resetPassword( newPassword: string, token: string):Promise<boolean>;
    invalidateResetToken(token: string): Promise<boolean>;
    findUserByResetToken(token: string): Promise<UserToken | null>;
}
