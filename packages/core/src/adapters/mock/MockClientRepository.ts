import { IClientRepository } from "../../repositories";
import { Address, AddressFormInput, AddressQueryOptions, Client, ClientFilter, ClientFilterInput, ClientType, ClientUpdateInput, Club, ClubInput, dataClientInput, defaultAddress, FactAddressInput, passwordClientInput } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError, NotFoundError } from "../../types/error";
import { ReturnAll } from '../../types/utils';
export class MockClientRepository implements IClientRepository {
    subscribeNewsletter(email: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
     

    async readAllPartnerClubs(): Promise<ReturnAll<Club>> {
        const clubs = [...SharedMemory.clubs];
        return {
            items: clubs,
            total: clubs.length,
            count: clubs.length
        };
    }

    async readClubByClientNumber(id: number): Promise<Club | null> {
        const client = SharedMemory.clients.find(c => c.clientNumber === id);
        if (!client || client.clubId === undefined || client.clubId === null) {
            return null;
        }
        const club = SharedMemory.clubs.find(cl => cl.id === client.clubId);
        return club || null;
    }


    async getAdressById(id: number): Promise<Address> {
        const address = SharedMemory.addresses.find(a => a.id === id);
        if (!address) {
            throw new NotFoundError(`Address with ID ${id} not found`);
        }
        return address;
    }

    async addAddress(address: AddressFormInput): Promise<Address> {
        const newAddress: Address = {
            id: SharedMemory.addresses.length + 1,
            numero_client: 0,
            designation: address.designation,
            civilite: '',
            nom: '',
            prenom: '',
            adresse: address.address,
            adresse2: address.complement ?? '',
            adresse3: address.building ?? '',
            code_postal: address.postalCode,
            ville: address.city,
            pays: address.country,
            interphone: '',
            code_porte: '',
            instructions: '',
            default: false,
            created_at: new Date(),
            updated_at: new Date(),
            societe: ''
        };

        SharedMemory.addresses.push(newAddress);
        return newAddress;
    }

    async getListAddress(adrq: AddressQueryOptions): Promise<Address[]> {
        let result = SharedMemory.addresses;

        if (adrq.clientNumber !== undefined) {
            result = result.filter(addr => addr.numero_client === adrq.clientNumber);
        }

        if (adrq.designation !== undefined) {
            result = result.filter(addr => addr.designation === adrq.designation);
        }

        if (adrq.def !== undefined) {
            result = result.filter(addr => addr.default === adrq.def);
        }

        if (adrq.limit !== undefined && adrq.limit > 0) {
            result = result.slice(0, adrq.limit);
        }

        return result;
    }

    updateClub(club: Club): Promise<Club> {
        throw new Error("Method not implemented.");
    }

    async readClub(options: ClientFilterInput): Promise<ReturnAll<Club>> {
        let clubs = [...SharedMemory.clubs];

        return {
            total: clubs.length,
            count: clubs.length,
            items: clubs
        };
    }


    async updateClientDetails(client: ClientUpdateInput, clientNumber: number): Promise<Client> {
        SharedMemory.users.push({
            id: (SharedMemory.users.length + 1).toString(),
            password: (SharedMemory.users.length + 1).toString(),
            is_anonymous: false,
            user_role: (SharedMemory.users.length + 1).toString(),
            last_name: "test",
            first_name: "user",
            email: "testuser@nataquashop.com"
        });

        const newClient: Client = {
            userId: (SharedMemory.users.length).toString(), // user added just now
            phone: '',
            mobilePhone: client.mobilePhone,
            workPhone: '',
            clubMemberId: client.clubMemberId ?? 0,
            clubId: client.clubId ?? 0,
            club: {
                id: 0,
                name: "Anonymized Club",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: false,
                siren: "",
                tvaNumber: "0"
            },
            email: "",
            firstName: "",
            lastName: "",
            clientNumber: clientNumber,
            type: client.type,
            lang: "",
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            fidelityPoints: 0,
            credit: 0,
            clientAddress: [],
            order: [],
            quotation: [],
            birthDate: new Date(),
            createdAt: new Date(),
        }
        return newClient;
    }

    async read(id: string): Promise<Client> {
        const client = SharedMemory.clients.find(c => c.userId === id);
        if (!client) {
            throw new NotFoundError(`Client with user id ${id} not found`);
        }
        return client;
    }

    async updateClient(client: ClientUpdateInput): Promise<Client> {
        if (!client.clientNumber) {
            throw new InternalServerError("clientNumber is required for update.");
        }
        const index = SharedMemory.clients.findIndex(
            c => c.clientNumber === client.clientNumber
        );
        if (index === -1) {
            throw new NotFoundError(`Client with client number ${client.clientNumber} not found`);
        }
        const existing = SharedMemory.clients[index] as Client;

        // Merge existing with input, input fields override existing ones
        const updated: Client = {
            ...existing,
            ...client,
        };

        SharedMemory.clients[index] = updated;

        return updated;
    }


    async deleteClientData(id: number): Promise<Client> {
        const clientIndex = SharedMemory.clients.findIndex(c => c.clientNumber === id);
        if (clientIndex === -1) {
            throw new NotFoundError(`Client with client number ${id} not found`);
        }

        const client = SharedMemory.clients[clientIndex];

        const userIndex = SharedMemory.users.findIndex(u => u.id === client?.userId);
        if (userIndex === -1) {
            throw new InternalServerError(`Associated user for client ${id} not found`);
        }

        const existingUser = SharedMemory.users[userIndex];
        if (!existingUser || !existingUser.id || !existingUser.user_role) {
            throw new InternalServerError(`Invalid user data for client ${id}`);
        }
        SharedMemory.users[userIndex] = {
            ...existingUser,
            email: "non-compte@nataquashop.com",
            is_anonymous: true,
            first_name: "Anonymous",
            last_name: "Anonymous",
            password: "",
            id: existingUser.id,
            user_role: existingUser.user_role,
        };


        return SharedMemory.clients[clientIndex] = {
            ...client,
            userId: client?.userId ?? "",
            email: "non-compte@nataquashop.com",
            firstName: "Anonymous",
            lastName: "Anonymous",
            phone: "",
            mobilePhone: "",
            workPhone: "",
            clubId: client?.clubId ?? 0,
            clubMemberId: client?.clubMemberId ?? 0,
            clientNumber: client?.clientNumber ?? 0,
            type: client?.type ?? ClientType.CLIENT,
            lang: client?.lang ?? "fr",
            birthDate: client?.birthDate ?? new Date(),
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            fidelityPoints: 0,
            credit: 0,
            order: [],
            quotation: [],
            createdAt: client?.createdAt ?? new Date(),
            club: client?.club ?? {
                id: 0,
                name: "Anonymized Club",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: false,
                siren: "",
                tvaNumber: "0"
            },
            clientAddress: [],
        };
    }

    async addClub(club: ClubInput): Promise<Club> {
        const newClub: Club = { ...club, id: SharedMemory.clubs.length + 1 };
        SharedMemory.clubs.push(newClub);
        return newClub;
    }

    async readByClientNumber(id: number): Promise<Client> {
        const client = SharedMemory.clients.find(client => client.clientNumber === id);
        if (!client) { throw new InternalServerError('Event not found') }
        return client;
    }

    async readAll(options: ClientFilter): Promise<ReturnAll<Client>> {
        const { limit, offset, sort } = options;

        const clients = 'asc' == sort
            ? [...SharedMemory.clients].sort((a, b) => a.clientNumber - b.clientNumber).slice(offset, offset + limit)
            : [...SharedMemory.clients].sort((a, b) => b.clientNumber - a.clientNumber).slice(offset, offset + limit);

        return {
            total: SharedMemory.clients.length,
            count: clients.length,
            items: clients as Client[]
        };
    }
    updatePasswordClient(client: passwordClientInput, userId: string): Promise<void> {
       const user = SharedMemory.users.find(u => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.password = client.password;
  return Promise.resolve();
}
     updateInformationClient(client: dataClientInput, userId: string): Promise<Client> {
        throw new Error("Method not implemented.");
    }  
    deletAdressClient(id: number): Promise<void> {
        SharedMemory.addresses = SharedMemory.addresses.filter(attribut => attribut.id !== id);
        return Promise.resolve();
    }
        anonymizeClientData(): Promise<Client> {
        const client = SharedMemory.clients.find(c => c.userId);
        if (!client) {
            throw new NotFoundError(`Client not found`);
        }
        const anonymizedClient: Client = {
            ...client,
            email: "exemple@nataquashop.com",
            lastName: "Anonyme",
            firstName: "Anonyme",
            phone: "0000000000",
            mobilePhone: "0000000000",
            workPhone: "0000000000",
            clientAddress: client.clientAddress ?? {
                nom: "Anonyme",
                prenom: "Anonyme",
                adresse: "Anonyme",
                adresse2: "Anonyme",
                adresse3: "Anonyme"
            }
        }
        const index = SharedMemory.clients.findIndex(c => c.userId === client.userId);
        if (index !== -1) {
            SharedMemory.clients[index] = anonymizedClient;
        }
        return Promise.resolve(anonymizedClient);
    }
    
 
    addFacturationAddress(address: FactAddressInput): Promise<Address> {
        const FactAddress: Address = {
            id: SharedMemory.addresses.length + 1,
            numero_client: 0,
            designation: "",
            civilite: '',
            nom: '',
            prenom: '',
            adresse: address.address,
            adresse2: address.complement ?? '',
            adresse3: address.building ?? '',
            code_postal: address.postalCode,
            ville: address.city,
            pays: address.country,
            interphone: '',
            code_porte: '',
            instructions: '',
            default: false,
            created_at: new Date(),
            updated_at: new Date(),
            societe: ''
        };
        SharedMemory.addresses.push(FactAddress);
        return Promise.resolve(FactAddress);
    }
    updateAddress(address: defaultAddress): Promise<Address> {
        const index = SharedMemory.addresses.findIndex(address => address.id === address.id);
        if (index === -1) {
            throw new NotFoundError(`Address with ID ${address.id} not found`);
        }
        const updateAddress: Address = {
            id: 1,
            default: address.default,
            numero_client: 0,
            designation: "",
            civilite: "",
            nom: "",
            prenom: "",
            adresse: "",
            adresse2: "",
            adresse3: "",
            code_postal: "",
            ville: "",
            pays: "",
            interphone: "",
            code_porte: "",
            instructions: "",
            created_at: new Date(),
            updated_at: new Date(),
            societe: ""
        }
        SharedMemory.addresses[index] = updateAddress;
        return Promise.resolve(updateAddress);

    }
async resetDefaultAddresses(userId: number, excludeAddressId?: number): Promise<void> {
       const clientAddresses = SharedMemory.addresses.filter(addr => addr.numero_client === userId);
       for (const addr of clientAddresses) {
           if (excludeAddressId && addr.id === excludeAddressId) {
               continue;
           }
           addr.default = false;
       }
       return Promise.resolve();
    }
   async getNumeroClientByUserId(userId: string): Promise<number> {
       const client = SharedMemory.clients.find(c => c.userId === userId);
       if (!client) {
           throw new NotFoundError(`Client with userId ${userId} not found`);
       }
       return client.clientNumber;
    }


}