import { InternalServerError } from "../../types/error";
import { Admin, NewAdmin } from "../../models/AccessSetting";
import { IAccessSettingRepository } from "../../repositories/IAccessSettingRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { SignUpRequest } from "../../models/User";
import { ReturnAll } from "../../types/utils";

export class AccessSettingRepository implements IAccessSettingRepository {
    private supabase: SupabaseClient;
    private supabaseAdmin: SupabaseClient;
        
    constructor(supabase: SupabaseClient, supabaseAdmin: SupabaseClient) {
        this.supabase = supabase;
        this.supabaseAdmin = supabaseAdmin;
    }
    
    async readAll(): Promise<ReturnAll<Admin>> {   
        const { data, error, count } = await this.supabase.from('permissions').select('*', {count: 'exact'});
        if (error) {
            throw error;
        }

        const items = data.map((user: any) => ({
            id: user.id,
            email: user.email,
            prenom: user.prenom,
            nom: user.nom,
            role: user.role,
            created_at: user.created_at ? new Date(user.created_at).toISOString() : ''
        }));

        return {
            total: count || 0,
            count: items.length,
            items: items
        };
    }

    async readByValidInvitationCode(validInvitationCode: string): Promise<Admin> {
        const { data, error } = await this.supabaseAdmin.from('permissions').select('*').eq('reset_password_code', validInvitationCode).single();
        if (error) {
            throw error;
        }
        return data;
    }

    async update(request: Admin): Promise<Admin> {
        const { error } = await this.supabase.from('permissions').update({
            role: request.role
        }).eq('id', request.id);

        if (error) {
            throw error;
        }

        return {
            ...request
        };
    }

    async delete(id: string, email: string): Promise<void> {        
        const { error } = await this.supabase.from('permissions').delete().eq('id', id);

        if (error) {
            throw error;
        }

        const findUser: any = await this.supabaseAdmin.rpc("get_user_id_by_email", {email: email}).single()
        if(findUser.data) {
            await this.supabaseAdmin.auth.admin.deleteUser(findUser.data.id);
        }
    }

    async create(request: NewAdmin, userToCreate: SignUpRequest, resetCode: string): Promise<Admin> {
      const email = userToCreate.email.trim().toLowerCase();
    
      // 1) Prépare metadata
      const userMetadata = {
        nom: userToCreate.lastName,
        prenom: userToCreate.firstName,
        adresse: userToCreate.Address,
        code_postal: userToCreate.postCode,
        ville: userToCreate.city,
        pays: userToCreate.country,
      };
    
      // 2) Tente la création (service_role)
      const { data: created, error: createErr } = await this.supabaseAdmin.auth.admin.createUser({
        email,
        password: userToCreate.password, 
        user_metadata: userMetadata,
        app_metadata: { role: request.role },
        email_confirm: true,
      });
    
      let userId: string | undefined = created?.user?.id;
    
      if (createErr) {
        if (createErr.message?.toLowerCase().includes('user already registered')) {
          const { data: existing, error: qErr } = await this.supabaseAdmin
            .from('auth.users') // nécessite postgrest + service_role; sinon, boucle listUsers() paginé
            .select('id, email')
            .eq('email', email)
            .maybeSingle();
    
          if (qErr || !existing) {
            throw new InternalServerError('User already exists but cannot be retrieved');
          }
          userId = existing.id;
    
          // Mets à jour app_metadata.role si nécessaire
          if(userId) {
            await this.supabaseAdmin.auth.admin.updateUserById(userId, {
              app_metadata: { role: request.role },
            });
          }
        } else {
          throw new InternalServerError(createErr.message || 'User creation failed');
        }
      }
    
      if (!userId) {
        throw new InternalServerError('No user id returned.');
      }
    
      const { data: perm, error: permErr } = await this.supabaseAdmin
        .from('permissions')
        .upsert({
          id: userId,
          email,
          prenom: userToCreate.firstName,
          nom: userToCreate.lastName,
          role: request.role,
          reset_password_code: resetCode,
        }, { onConflict: 'id' })
        .select()
        .single();
    
      if (permErr) {          
        if (created?.user?.id) {
          await this.supabaseAdmin.auth.admin.deleteUser(created.user.id);
        }
        throw new InternalServerError('Failed to upsert permission: ' + permErr.message);
      }
    
      return {
        ...request,
        id: perm.id,
        created_at: perm.created_at ? new Date(perm.created_at).toISOString() : '',
      };
    }

    async updatePassword(userId: string, password: string): Promise<Admin> {
      const { error } = await this.supabaseAdmin.auth.admin.updateUserById(userId, {
          password: password
      });

      if (error) {
          throw error;
      }

      const { data: permissionData, error: updateError } = await this.supabaseAdmin.from('permissions')
        .update({reset_password_code: null})
        .eq('id', userId)
        .select("*")
        .single();

      if (updateError) {
          throw updateError;
      }

      return {
        ...permissionData,
        id: permissionData.id,
        created_at: permissionData.created_at ? new Date(permissionData.created_at).toISOString() : '',
      };
    }
}   