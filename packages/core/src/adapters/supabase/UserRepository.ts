import { SupabaseClient } from "@supabase/supabase-js";
import { IUserRepository } from "../../repositories";
import { NewUserClient, ResetPasswordData, SignUpClub, SignUpPayload, SignUpRequest, SignUpRequestWithoutPassword, UserData } from "../../models/User";
import { InternalServerError } from "../../types/error";
import { generateToken, UserToken } from "../../types/utils";

export class UserRepository implements IUserRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  async resetPassword(newPassword: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) {
      throw new InternalServerError(error.message);
    }
    return true;
  }

  async findUserByResetToken(token: string): Promise<UserToken | null> {
    const { data, error } = await this.supabase
      .from("clients")
      .select("id_user, email, reset_password_expires_at")
      .eq("reset_password_token", token)
      .single(); 

    if (error) {
      console.error("Error finding user by reset token:", error);
      return null;
    }

    return data;
  }

  async invalidateResetToken(token: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("clients")
      .update({
        reset_password_token: null,
        reset_password_expires_at: null,
      })
      .eq("reset_password_token", token);

    if (error) {
      console.error("Error invalidating reset token:", error);
      return false;
    }

    return true;
  }

  async generateResetPasswordLink(email: string): Promise<ResetPasswordData | null> {
    const { data: userData, error: userError } = await this.supabase
      .from("clients")
      .select("id_user, prenom")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      if (userError?.message.includes("User with this email not found")) return null;
      throw new InternalServerError(userError?.message || "Error fetching user");
    }

    const firstName = userData.prenom;
    const userId = userData.id_user;

    const token = generateToken();
    //expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const { error: updateError } = await this.supabase
      .from("clients")
      .update({
        reset_password_token: token,
        reset_password_expires_at: expiresAt,
      })
      .eq("id_user", userId);

    if (updateError) {
      throw new InternalServerError(updateError.message);
    }
    const resetLink = `reset-password?token=${token}`;

    return {
      prenom: firstName,
      lien_de_connexion: resetLink,
      site: "nataquashop.com",
    };
  }


  async updateUserByAdmin(user: SignUpRequestWithoutPassword, clientNumber: number): Promise<number> {

    const { data: clientData, error: clientError } = await this.supabase
      .from('clients')
      .select('id_user, numero_client')
      .eq('numero_client', clientNumber)
      .single();

    if (clientError || !clientData) {
      throw new InternalServerError("Failed to retrieve client number.");
    }

    const userId = clientData.id_user;

    const userMetadata = {
      nom: user.lastName,
      prenom: user.firstName,
      adresse: user.Address,
      code_postal: user.postCode,
      ville: user.city,
      pays: user.country,
    };

    const { data: createdData, error: createError } = await this.supabase.auth.admin.updateUserById(
      userId,
      {
        email: user.email,
        user_metadata: userMetadata,
      });

    if (createError) {
      throw new InternalServerError(createError.message || "User creation failed");
    }

    if (!createdData?.user) {
      throw new InternalServerError("User creation failed: no user data returned.");
    }


    return clientData.numero_client;
  }


  async createUserByAdmin(user: SignUpRequest): Promise<NewUserClient> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error) {
      throw new InternalServerError("Failed to list users: " + error.message);
    }

    const existingUser = data.users.find(u => u.email === user.email);

    if (existingUser) {
      const { data: dataClient, error: errorClient } = await this.supabase
        .from('clients')
        .select('numero_client')
        .eq('email', user.email)
        .single();
      if (errorClient || !dataClient) {
        throw new InternalServerError(errorClient.message);
      }
      return { numero_client: dataClient.numero_client, isNew: false };
    }

    const userMetadata = {
      nom: user.lastName,
      prenom: user.firstName,
      adresse: user.Address,
      code_postal: user.postCode,
      ville: user.city,
      pays: user.country,
    };

    const { data: createdData, error: createError } = await this.supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: userMetadata,
    });

    if (createError) {
      throw new InternalServerError(createError.message || "User creation failed");
    }

    if (!createdData?.user) {
      throw new InternalServerError("User creation failed: no user data returned.");
    }

    const userId = createdData.user.id;

    const { data: clientData, error: clientError } = await this.supabase
      .from('clients')
      .select('numero_client')
      .eq('id_user', userId)
      .single();

    if (clientError || !clientData) {
      throw new InternalServerError("Failed to retrieve client number.");
    }

    return { numero_client: clientData.numero_client, isNew: true };
  }
  async createClubUser(userData: SignUpClub): Promise<boolean> {
    const { data: authUser, error: authError } = await this.supabase.auth.signUp({
      email: userData.user.email,
      password: userData.user.password,
      options: {
        data: {
          nom: userData.client.lastName,
          prenom: userData.client.firstName,
          telephone_domicile: userData.client.phone,
          telephone_portable: userData.client.mobilePhone,
          type: "CLUB",
          civilité: userData.address.civility,
          adresse: userData.address.address,
          adresse2: userData.address.complement,
          adresse3: userData.address.building,
          code_postal: userData.address.postalCode,
          ville: userData.address.city,
          pays: userData.address.country

        }
      }
    })
    if (authError) {
      throw new InternalServerError(authError.message);
    }
    const userId = authUser.user?.id;

    if (!userId) { throw new InternalServerError("Failed to retrieve UserID"); }
    const { data: dataClient, error: clientError } = await this.supabase
      .from('clients')
      .select('numero_client')
      .eq('id_user', userId)
      .single();

    if (clientError || !dataClient) {
      throw new InternalServerError("Failed to retrieve client number.");
    }
    const clientNumber = dataClient.numero_client;
    const { data: clubData, error: clubError } = await this.supabase
      .from('clubs')
      .insert({
        nom: userData.club.name,
        president: userData.club.president,
        referent: userData.club.referent,
        siren: userData.club.siren,
        numero_tva: userData.club.tvaNumber,
        email: userData.user.email,
        partenaire: true,
        valide: true
      })
      .select('id')
      .single();

    if (clubError) {
      throw new InternalServerError("Failed to retrieve club information.");
    }
    const clubId = clubData.id;
    const { error: updateClientError } = await this.supabase
      .from("clients")
      .update({ id_club: clubId })
      .eq("numero_client", clientNumber);

    if (updateClientError) {
      throw new InternalServerError("Failed to update client information.");
    }

    return true;
  }
  async createUser(userData: SignUpPayload): Promise<{ success: boolean; error?: string }> {
    try {
      //check if user already registered
      const { data: dataClient, error: clientError } = await this.supabase
        .from('clients')
        .select('email')
        .eq('email', userData.user.email)
        .maybeSingle();

      if (clientError) {
        return { success: false, error: "Unexpected error" };
      }

      if (dataClient) {
        return { success: false, error: "Cette adresse email est déjà utilisée" };
      }

      //signup
      const { data: authUser, error: authError } = await this.supabase.auth.signUp({
        email: userData.user.email,
        password: userData.user.password,
        options: {
          data: {
            nom: userData.client.lastName,
            prenom: userData.client.firstName,
            date_naissance: userData.client.birthDate,
            telephone_domicile: userData.client.phone,
            telephone_portable: userData.client.mobilePhone,
            id_club: userData.client.clubId,
            type: "CLIENT",
            civilité: userData.address.civility,
            adresse: userData.address.address,
            adresse2: userData.address.complement,
            adresse3: userData.address.building,
            code_postal: userData.address.postalCode,
            ville: userData.address.city,
            pays: userData.address.country,
            societe: userData.address.company,
          }
        }
      });

      if (authError) {
        return { success: false, error: "Erreur lors du signup" };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message ?? "Unexpected error" };
    }
  }



}
