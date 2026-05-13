import { NewUserClient, ResetPasswordData, SignUpClub, SignUpPayload, SignUpRequest, SignUpRequestWithoutPassword, UserData } from "../../models/User";
import { IUserRepository } from "../../repositories/IUserRepository";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { ClientType, } from "../../models/Client";
import { UserToken } from "../../types/utils";


export class MockUserRepository implements IUserRepository {
  invalidateResetToken(token: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  findUserByResetToken(token: string): Promise<UserToken | null> {
    throw new Error("Method not implemented.");
  }
  
  createClubUser(user: SignUpClub): Promise<boolean> {
    const newUserId = (SharedMemory.users.length + 1).toString();
    const newNumeroClient = SharedMemory.clients.length + 1;
    const newAddressClient = SharedMemory.addresses.length + 1;
    const newClubId = SharedMemory.clubs.length + 1;

    SharedMemory.users.push({
      id: newUserId,
      last_name: user.client.lastName,
      first_name: user.client.firstName,
      email: user.user.email,
      password: user.user.password,
      is_anonymous: false,
      user_role: "client"
    });

    SharedMemory.clients.push({      
      userId: newUserId,
      email: user.user.email,
      lastName: user.client.lastName,
      firstName: user.client.firstName,
      phone: user.client.phone || "",
      mobilePhone: user.client.mobilePhone || "",
      workPhone: "",
      clubMemberId: 0,
      clubId: 0,
      clientNumber: newNumeroClient,
      type: ClientType.CLUB_PARTENAIRE,
      lang: "",
      newsLetter: false,
      siteOffer: false,
      partnerOffer: false,
      credit: 0,
      fidelityPoints: 0,
      birthDate: new Date(),
      clientAddress: [],
      order: [],
      quotation: [],
      createdAt: ""
    });

    SharedMemory.addresses.push({
      id: newAddressClient,
      numero_client: newNumeroClient,
      designation: "",
      civilite: user.address.civility || "",
      nom: user.client.lastName,
      prenom: user.client.firstName,
      adresse: user.address.address || "",
      adresse2: user.address.complement || "",
      adresse3: user.address.building || "",
      code_postal: user.address.postalCode || "",
      ville: user.address.city || "",
      pays: user.address.country || "",
      interphone: "",
      code_porte: "",
      instructions: "",
      default: false,
      created_at: new Date(),
      updated_at: new Date(),
      societe: ""
    });

    SharedMemory.clubs.push({
      id: newClubId,
      name: user.club.name,
      president: user.club.president,
      referent: user.club.referent,
      siren: user.club.siren,
      tvaNumber: user.club.tvaNumber,
      email: user.user.email,
      partner: true,
      valid: true,
      accountantAccount: "",
      paymentMode: 0,
      paymentDelay: 0,
      phone: "",
      code: ""
    });

    return Promise.resolve(true);
  }

  createUser(user: SignUpPayload): Promise<{ success: boolean; error?: string }> {
    const newUserId = (SharedMemory.users.length + 1).toString();
    const newNumeroClient = SharedMemory.clients.length + 1;
    const newAddressClient = SharedMemory.addresses.length + 1;
     SharedMemory.users.push({
       id: newUserId,
       last_name: user.client.lastName,
       first_name: user.client.firstName,
       email: user.user.email,
       password: user.user.password,
       is_anonymous: false,
       user_role: ""
     })
      SharedMemory.clients.push({
        userId: newUserId,
        email: user.user.email,
        lastName: user.client.lastName,
        firstName: user.client.firstName,
        phone: user.client.phone || "",
        mobilePhone: user.client.mobilePhone || "",
        workPhone: "",
        clubMemberId: 0,
        clubId: 0,
        clientNumber: newNumeroClient,
        type: ClientType.CLIENT,
        lang: "",
        newsLetter: false,
        siteOffer: false,
        partnerOffer: false,
        credit: 0,
        fidelityPoints: 0,
        birthDate: new Date(),
        clientAddress: [],
        order: [],
        quotation: [],
        createdAt: ""
      })
      SharedMemory.addresses.push({
        id: newAddressClient,
        numero_client: newNumeroClient,
        designation: "",
        civilite: user.address.civility || "",
        nom: user.client.lastName,
        prenom: user.client.firstName,
        adresse: user.address.address || "",
        adresse2: user.address.complement || "",
        adresse3: user.address.building || "",
        code_postal: user.address.postalCode || "",
        ville: user.address.city || "",
        pays: user.address.country || "",
        interphone: "",
        code_porte: "",
        instructions: "",
        default: false,
        created_at: new Date(),
        updated_at: new Date(),
        societe: ""
      })
   return Promise.resolve({success: true});
  }
 

  async createUserByAdmin(user: SignUpRequest): Promise<NewUserClient> {
    const existingUser = SharedMemory.users.find(u => u.email === user.email);

    if (existingUser) {
      const client = SharedMemory.clients.find(c => c.email === user.email);
      if (!client) {
        throw new InternalServerError("Client exists in users but not found in clients");
      }
      return { numero_client: client.clientNumber, isNew: false };
    }

    const newUserId = (SharedMemory.users.length + 1).toString();
    const newNumeroClient = SharedMemory.clients.length + 1;

    SharedMemory.users.push({
      id: newUserId,
      email: user.email,
      password: user.password,
      first_name: user.firstName,
      last_name: user.lastName,
      is_anonymous: false,
      user_role: "client",
    });
    SharedMemory.clients.push({
      userId: newUserId,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      phone: "",
      mobilePhone: "",      
      workPhone: "",
      clubMemberId: 0,
      clubId: 0,
      clientNumber: newNumeroClient,
      type: ClientType.CLIENT,
      lang: "",
      newsLetter: false,
      siteOffer: false,
      partnerOffer: false,
      credit: 0,
      fidelityPoints: 0,
      birthDate: new Date(),
      clientAddress: [{
        id: 0,
        numero_client: 0,
        designation: "",
        civilite: "",
        nom: "",
        prenom: "",
        adresse: user.Address,
        adresse2: "",
        adresse3: "",
        code_postal: user.postCode,
        ville: user.city,
        pays: user.country,
        interphone: "",
        code_porte: "",
        instructions: "",
        default: false,
        created_at: new Date(),
        updated_at: new Date(),
        societe: ""
      }],
      order: [],
      quotation: [],
      createdAt: "",
    });

    return { numero_client: newNumeroClient, isNew: true };
  }

  async updateUserByAdmin(user: SignUpRequestWithoutPassword, clientNumber: number): Promise<number> {
    const client = SharedMemory.clients.find(c => c.clientNumber === clientNumber);
    if (!client) {
      throw new InternalServerError(`Client with numero_client ${clientNumber} not found.`);
    }

    const userRecord = SharedMemory.users.find(u => u.id === client.userId);
    if (!userRecord) {
      throw new InternalServerError(`User with id ${client.userId} not found.`);
    }

    // Update user fields
    userRecord.email = user.email;
    userRecord.first_name = user.firstName;
    userRecord.last_name = user.lastName;


    // Update client fields
    client.email = user.email;
    client.firstName = user.firstName;
    client.lastName = user.lastName;


    return client.clientNumber;
  }
    async generateResetPasswordLink(email: string): Promise<ResetPasswordData | null> {
    return {
      prenom:"",
      site:"nataquashop@com",
      lien_de_connexion:"`https://dev.nataquashop.com/fr/reset-password?token=mocked-token&email=${encodeURIComponent(email)}`;"
    }
  }
  resetPassword(newPassword: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
 
}
