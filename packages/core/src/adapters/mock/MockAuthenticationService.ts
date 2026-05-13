import type { IAuthenticationService } from "../../services/IAuthenticationService";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../types/error";
import { User, ValidateInvitation } from "../../models/User";
import { SharedMemory } from "./SharedMemory";

let signUser: User | undefined = undefined;

export class MockAuthenticationService implements IAuthenticationService {
    async signInAnonymously(): Promise<User> {
        signUser = new User({
            id: '1',
            email: 'test@test.com',
            user_role: '',
            is_anonymous: true,
            last_name: '',
            first_name: '',
        });

        return signUser;
    }

    async updateSession(request: any): Promise<{ user?: User; response: any; }> {
        throw new Error("Method not implemented.");
    }

    async signIn(email: string, password: string): Promise<User> {
        const user = SharedMemory.users.find(user => user.email === email);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.password !== password) {
            throw new UnauthorizedError('Invalid password');
        }

        signUser = new User({...user});

        return signUser;
    }

    async signOut(): Promise<void> {
        signUser = undefined;
        return;
    }

    async getUser(): Promise<User | undefined> {
        return signUser;
    }

    async validateInvitation(userId: string, validateInvitation: ValidateInvitation): Promise<boolean> {
        if (validateInvitation.password !== validateInvitation.confirmPassword) {
            throw new BadRequestError("Password and confirm password do not match");
        }
        const user = SharedMemory.users.find(user => user.id === userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        user.password = validateInvitation.password;
        signUser = new User({...user});
        return true;
    }
}