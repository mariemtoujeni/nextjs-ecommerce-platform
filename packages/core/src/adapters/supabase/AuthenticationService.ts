import { jwtDecode } from "jwt-decode";
import { User, ValidateInvitation } from "../../models/User";
import { IAuthenticationService } from "../../services/IAuthenticationService";
import { InternalServerError, UnauthorizedError } from "../../types/error";
import { createClientWithResponse } from "./server";
import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";


export class AuthenticationService implements IAuthenticationService {

    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    private formatUser(data: any, access_token: string): User {
        const jwt: any = jwtDecode(access_token);

        return new User({
            id: data.id,
            email: data.email ? data.email : '',
            is_anonymous: data.is_anonymous ? data.is_anonymous : false,
            first_name: data.user_metadata.prenom ? data.user_metadata.prenom : '',
            last_name: data.user_metadata.nom ? data.user_metadata.nom : '',
            user_role: jwt.user_role ? jwt.user_role : ''
        });
    }

    async signIn(email: string, password: string): Promise<User> {

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if(error) {
            throw new UnauthorizedError(error.message);
        }

        const { user, session: { access_token } } = data;
        
        return this.formatUser(user, access_token);
    }

    async updateSession(request: NextRequest): Promise<{user?: User, response: any}> {
        const { supabase, response } = await createClientWithResponse(request);

        const getSession = await supabase.auth.getSession();

        if(getSession.error || !getSession.data.session) {
            return { user: undefined, response: response };
        }

        const getUser = await supabase.auth.getUser();
        
        if(getUser.error ) {
            console.log('getUser error', getUser.error);
            return { user: undefined, response: response };
        } 

        const { session: { access_token } } = getSession.data as { session: { access_token: string } };

        return { user: this.formatUser(getUser.data.user, access_token), response: response };
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut({scope: 'local' });
    }

   async getUser(): Promise<User | undefined> {
        const getUser = await this.supabase.auth.getUser();
        
        if(getUser.error) {
            return undefined;
        }

        const getSession = await this.supabase.auth.getSession();
        
        if(getSession.error) {
            return undefined;
        }

        const { session: { access_token } } = getSession.data as { session: { access_token: string } };

        return this.formatUser(getUser.data.user, access_token);
    }

    async signInAnonymously(): Promise<User> {
        const { data, error } = await this.supabase.auth.signInAnonymously();

        if(error) {
            throw new UnauthorizedError(error.message);
        }

        return this.formatUser(data.user, data.session?.access_token || '');
    }

    async validateInvitation(userId: string, validateInvitation: ValidateInvitation): Promise<boolean> {
        const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
            password: validateInvitation.password
        });

        if(error) {
            throw new InternalServerError(error.message);
        }

        return true;
    }
}