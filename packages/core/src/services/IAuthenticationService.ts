import { User, ValidateInvitation } from "../models";

export interface IAuthenticationService {
    signIn(email: string, password: string): Promise<User>
    updateSession(request: any): Promise<{user?: User, response: any}>;
    signOut(): Promise<void>;
    getUser(): Promise<User | undefined>;
    signInAnonymously(): Promise<User>;
    validateInvitation(userId: string, validateInvitation: ValidateInvitation): Promise<boolean>;
}