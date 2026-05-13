import { AddressFormInput, Client, Address,
         ClientFilter, ClientUpdateInput,
         Club, ClubFilterInput, ClubInput, 
         AddressQueryOptions,
         defaultAddress,
         FactAddressInput,
         dataClientInput,
         passwordClientInput,
         
         
         
        
         } from "../models";
import { ReturnAll } from "../types/utils";

export interface IClientRepository {
    read(userId: string): Promise<Client>;
    readAll(options: ClientFilter): Promise<ReturnAll<Client>>;
    readByClientNumber(id: number): Promise<Client>;
    updateClient(client: ClientUpdateInput): Promise<Client>;
    deleteClientData(id: number): Promise<Client>;
    addClub(club: ClubInput): Promise<Club>;
    readClub(options: ClubFilterInput): Promise<ReturnAll<Club>>;
    updateClub(club: Club): Promise<Club>;
    addAddress(address: AddressFormInput, client: Client): Promise<Address>;
    getListAddress(adrq: AddressQueryOptions): Promise<Address[]>;
    getAdressById(id: number): Promise<Address>;
    readAllPartnerClubs(): Promise<ReturnAll<Club>>;
    readClubByClientNumber(id: number): Promise<Club | null>;
    updateAddress(address: defaultAddress): Promise<Address>;
    addFacturationAddress(address: FactAddressInput, client: Client): Promise<Address>;
    anonymizeClientData():Promise<Client>;
    updateInformationClient(client:dataClientInput,userId: string):Promise<Client>;
    updatePasswordClient(client:passwordClientInput,userId: string):Promise<void>;
    deletAdressClient(id: number):Promise<void>;    
    subscribeNewsletter(email: string): Promise<boolean>;
    resetDefaultAddresses(userId: number, excludeAddressId?: number): Promise<void>
    getNumeroClientByUserId(userId: string): Promise<number>
    

}

