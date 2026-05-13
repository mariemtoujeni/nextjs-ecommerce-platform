import { IClientRepository } from "../../repositories";
import {
    Client, ClientFilter, ClientFilterTypeAdmin,
    ClientType, ClientUpdateInput, Club, ClubFilter,
    ClubInput, ClubWithClients, Order, Quotation, Address,
    AddressFormInput, AddressQueryOptions, QuotationStatus,
    defaultAddress,
    FactAddressInput,
    dataClientInput,
    passwordClientInput,
    Store } from "../../models";
import { ActiveFilter, ReturnAll } from "../../types/utils";


import { SupabaseClient } from "@supabase/supabase-js";
import { InternalServerError, NotFoundError, UnauthorizedError } from "../../types/error";
import { KeyMap, mapToType } from "./MapToType";
import { storeKeyMap } from "./StoreRepository";




const quotationKeyMap: KeyMap<Quotation> = {
    id: 'id',
    title: 'intitule',
    shippingFees: 'frais_port',
    rest: 'reste',
    withoutTVA: 'sans_tva',
    totalDiscount: 'total_reductions',
    clientComment: 'commentaire_client',
    usedCredit: 'credit_utilise',
    version: 'version',
    deliveryMode: 'mode_livraison',
    createdAt: 'date_creation',
    orderId: 'id_commande',
    clubId: 'id_club',
    club: {
        key: 'clubs',
        transform: (value) => mapToType<Club>(value, clubKeyMap)
    },
    clientNumber: 'numero_client',
    status: {
        key: 'statut',
        transform: (value) => value as QuotationStatus
    },
    totalAmount: 'montant_total',
    client: {
        key: 'clients',
        transform: (value) => mapToType<Client>(value, clientKeyMap),
    },
    order: {
        key: 'commandes',
        transform: (value) => mapToType<Client>(value, clientKeyMap),
    },
};




export const clientKeyMap: KeyMap<Client> = {
    userId: 'id_user',
    email: 'email',
    firstName: 'prenom',
    lastName: 'nom',
    phone: 'telephone_domicile',
    mobilePhone: 'telephone_portable',
    workPhone: 'telephone_travail',
    clubMemberId: 'id_club_adherent',
    clubId: 'id_club',
    club: {
        key: 'clubs',
        transform: (value) => mapToType<Club>(value, clubKeyMap)
    },
    clientNumber: 'numero_client',
    type: 'type',
    lang: 'langue',
    birthDate: 'date_naissance',
    newsLetter: 'newsletter',
    siteOffer: 'offre_site',
    partnerOffer: 'offre_partenaire',
    fidelityPoints: 'points_fidelite',
    credit: 'credit',
    clientAddress: {
        key: 'client_adresses',
        transform: (value) => Array.isArray(value) ? value.map(addr => mapToType<Address>(addr, clientAddressKeyMap)) : [],
    },
    order: {
        key: 'commandes',
        transform: (value) => Array.isArray(value) ? value.map(ord => mapToType<Order>(ord, orderKeyMap)) : []
    },
    quotation: {
        key: 'devis',
        transform: (value) => Array.isArray(value) ? value.map(quot => mapToType<Quotation>(quot, quotationKeyMap)) : []
    },
    createdAt: 'created_at',
};

export const clubKeyMap: KeyMap<Club> = {
    id: 'id',
    name: 'nom',
    president: 'president',
    email: 'email',
    accountantAccount: 'compte_comptable',
    paymentMode: 'mode_paiement',
    paymentDelay: 'delai_paiement',
    referent: 'referent',
    phone: 'telephone',
    partner: 'partenaire',
    code: 'code',
    valid: 'valide',
    siren: 'siren',
    tvaNumber: 'numero_tva',
    clubStore: {
        key: 'magasins',
        transform: (value) => Array.isArray(value)
            ? value.map(store => mapToType<Store>(store, storeKeyMap))
            : []
    }
}

export const clientAddressKeyMap: KeyMap<Address> = {
    id: "id",
    numero_client: "numero_client",
    designation: "designation",
    civilite: "civilite",
    nom: "nom",
    prenom: "prenom",
    adresse: "adresse",
    adresse2: "adresse2",
    adresse3: "adresse3",
    code_postal: "code_postal",
    ville: "ville",
    pays: "pays",
    interphone: "interphone",
    code_porte: "code_porte",
    instructions: "instructions",
    default: "defaut",
    created_at: "created_at",
    updated_at: "updated_at",
    societe: "societe"
}

export const orderKeyMap: KeyMap<Order> = {
    id: 'id',
    clientId: 'numero_client',
    amount: 'montant',
    createdAt: 'date_creation',
    status: 'statut',
    deliveryFees: "frais_port",
    withoutVAT: "sans_tva",
    quotation: "devis",
    deliveryMode: "mode_livraison",
    usedCredit: "credit_utilise",
    totalDiscount: "total_reductions",
    authorisation: "autorisation",
    paymentMode: "mode_paiement",
    authorisationDate: "date_autorisation",
    boutique: "boutique"
}

export const clubWithClientsKeyMap: KeyMap<ClubWithClients> = {
    ...clubKeyMap,
    clients: {
        key: 'clients',
        transform: (value) => Array.isArray(value)
            ? value.map(data => mapToType<Client>(data, clientKeyMap))
            : []
    },
}

const ANONYMOUS_CLIENT_DATA = {
    email: 'non-compte@nataquashop.com',
    nom: 'Anonyme',
    prenom: 'Anonyme',
    telephone_portable: '0000000000',
    telephone_domicile: '0000000000',
    telephone_travail: '0000000000',
    type: ClientType.CLIENT,
    langue: 'fr',
    newsletter: true,
    offre_site: true,
    offre_partenaire: false,
    credit: 0,
    points_fidelite: 0,
};


type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const clientFilter: Record<ClientFilterTypeAdmin, FilterMappginFunction> = {
    [ClientFilterTypeAdmin.TYPE]: (baseQuery, filter) => ({
        column: "type",
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
    [ClientFilterTypeAdmin.MEMBRE_CLUB]: (baseQuery, filter) => ({
        column: 'id_club_adherent',
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
};


export class ClientRepository implements IClientRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    

    async subscribeNewsletter(email: string): Promise<boolean> {
        const { data, error } = await this.supabase.from('clients').update({
            newsletter: true
        }).eq('email', email);
        if (error) { return false }
        return true;
    }


    async readClubByClientNumber(clientNumber: number): Promise<Club | null> {
        // Step 1: Get the client by numero_client
        const { data: clientData, error: clientError } = await this.supabase
            .from('clients')
            .select('id_club')
            .eq('numero_client', clientNumber)
            .single();

        if (clientError) {
            throw new Error(`Client lookup failed: ${clientError.message}`);
        }

        const clubId = clientData?.id_club;

        if (!clubId) {
            return null; // No club associated
        }

        // Step 2: Get the club by club_id
        const { data: clubData, error: clubError } = await this.supabase
            .from('clubs')
            .select('*')
            .eq('id', clubId)
            .single();

        if (clubError) {
            throw new Error(`Club lookup failed: ${clubError.message}`);
        }

        return mapToType<Club>(clubData, clubKeyMap);
    }


    async readAllPartnerClubs(): Promise<ReturnAll<Club>> {
        const { data, count, error } = await this.supabase
            .from('clubs')
            .select('*', { count: 'exact' })

        if (error) {
            throw new InternalServerError(error.message);
        }

        return {
            items: data ? data.map(club => mapToType<Club>(club, clubKeyMap)) : [],
            total: count ?? 0,
            count: data ? data.length : 0,
        };
    }

    async getAdressById(id: number): Promise<Address> {
        const { data, error } = await this.supabase.from('client_adresses').select('*').eq('id', id).maybeSingle();
        if (error) throw new InternalServerError(error.message);
        return mapToType<Address>(data, clientAddressKeyMap)
    }

    async getListAddress(adrq: AddressQueryOptions): Promise<Address[]> {
        let query = this.supabase.from('client_adresses').select('*');

        if (adrq.clientNumber !== undefined && adrq.clientNumber !== null) {
            query = query.eq('numero_client', adrq.clientNumber);
        }

        if (adrq.designation !== undefined && adrq.designation !== null && adrq.designation.trim() !== '') {
            query = query.eq('designation', adrq.designation);
        }

        if (adrq.def === true) {
            query = query.eq('defaut', true);
        }

        if (adrq.limit !== undefined && adrq.limit !== null && adrq.limit > 0) {
            query = query.limit(adrq.limit);
        }

        const addressList = await query;
        if (addressList.error) { throw new NotFoundError(addressList.error.message) }

        return addressList?.data ? addressList.data.map(address => mapToType<Address>(address, clientAddressKeyMap)) : [];
    }


    async addAddress(address: AddressFormInput, client: Client): Promise<Address> {
        const { data, error } = await this.supabase
            .from('client_adresses')
            .insert({
                prenom: client.firstName,
                nom: client.lastName,
                numero_client: client.clientNumber,
                designation: address.designation,
                adresse: address.address,
                adresse2: address.complement,
                adresse3: address.building,
                code_postal: address.postalCode,
                ville: address.city,
                pays: address.country,
            })
            .select('*')
            .single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Address>(data, clientAddressKeyMap);
    }

    async updateClub(club: Club): Promise<Club> {
        const { data, error } = await this.supabase.from('clubs').update({
            nom: club.name,
            referent: club.referent,
            telephone: club.phone,
            president: club.president,
            email: club.email,
            compte_comptable: club.accountantAccount,
            mode_paiement: club.paymentMode,
            delai_paiement: club.paymentDelay,
            partenaire: club.partner,
            code: club.code,
            siren: club.siren,
            numero_tva: club.tvaNumber,
            valide: club.valid,
        }).eq('id', club.id).select('*').single();
        if (error) { throw new InternalServerError(error.message) }
        return mapToType<Club>(data, clubKeyMap);
    }

    async readClub(options: ClubFilter): Promise<ReturnAll<Club>> {
        let query = this.supabase
            .from('clubs')
            .select('*', { count: 'exact' })

        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                query.eq('id', searchAsNumber);
            } else {
                query = query.or(`nom.ilike.%${options.search}%`);
            }
        }
        if (options.filters) {
            options.filters.forEach(filter => clientFilter[filter.key as ClientFilterTypeAdmin](query, filter));
        }
        const clubs = await query;

        if (clubs.error) throw new NotFoundError(clubs.error.message);

        return {
            items: clubs?.data ? clubs.data.map(club => mapToType<Club>(club, clubKeyMap)) : [],
            total: clubs?.count ?? 0,
            count: clubs?.data ? clubs.data.length : 0,
        };
    }

    async readAddress(): Promise<Address> {
        const { data, error } = await this.supabase.from('client_adresses').select('*');
        if (error) throw new NotFoundError(error.message);
        return mapToType<Address>(data, clientAddressKeyMap);
    }

    async read(id: string): Promise<Client> {
        const { data, error } = await this.supabase
            .from('clients')
            .select('*, clubs:id_club(*, magasins(*)), client_adresses(*), commandes(*)')
            .eq('id_user', id)
            .maybeSingle();

        if (error) throw new NotFoundError(`Client with user id ${id} not found`);

        if (!data?.clubs) {
            const { data: fallbackData, error: fallbackError } = await this.supabase
                .from('clients')
                .select('*, clubs:id_club_adherent(*, magasins(*)), client_adresses(*), commandes(*)')
                .eq('id_user', id)
                .maybeSingle();

            if (fallbackError) throw new NotFoundError(`Client with user id ${id} not found`);

            return mapToType<Client>(fallbackData, clientKeyMap);
        }

        return mapToType<Client>(data, clientKeyMap);
    }

    async deleteClientData(id: number): Promise<Client> {
        const { data, error } = await this.supabase.from('clients')
            .update(ANONYMOUS_CLIENT_DATA)
            .eq('numero_client', id).select('*, club:id_club(*), client_adresses(*), commandes(id, montant)')
            .single();

        if (error) {
            throw new InternalServerError(error.message);
        }

        return mapToType<Client>(data, clientKeyMap);
    }

    async addClub(club: ClubInput): Promise<Club> {
        const { data, error } = await this.supabase
            .from('clubs')
            .insert({
                nom: club.name,
                referent: club.referent,
                telephone: club.phone,
                president: club.president,
                email: club.email,
                compte_comptable: club.accountantAccount,
                mode_paiement: club.paymentMode,
                delai_paiement: club.paymentDelay,
                partenaire: club.partner,
                code: club.code,
                siren: club.siren,
                numero_tva: club.tvaNumber,
                valide: club.valid,
            })
            .select('*')
            .single();

        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Club>(data, clubKeyMap);
    }

    async updateClient(client: ClientUpdateInput): Promise<Client> {
        const clientUpdate: any = {
            numero_client: client.clientNumber,
            nom: client.lastName,
            prenom: client.firstName,
            email: client.email,
            telephone_domicile: client.phone,
            telephone_travail: client.workPhone,
            telephone_portable: client.mobilePhone,
            type: client.type,
            points_fidelite: client.fidelityPoints,
            credit: client.credit,
            newsletter: client.marketingEmail,
            offre_site: client.marketingSMS,
        };

        if (client.clubId) {
            clientUpdate.id_club = client.clubId;
        }

        if (client.clubMemberId) {
            clientUpdate.id_club_adherent = client.clubMemberId;
        }

        const { data: clientDataRaw, error: clientError } = await this.supabase
            .from('clients')
            .update(clientUpdate)
            .eq('numero_client', client.clientNumber)
            .select('*, clubs:id_club(*), client_adresses(*), commandes(id, montant)')
            .single();

        if (clientError) {
            throw new Error(`Client update failed: ${clientError.message}`);
        }

        const { data: addressData, error: addressError } = await this.supabase
            .from('client_adresses')
            .update({
                numero_client: client.clientNumber,
                societe: client.company,
                pays: client.country,
                ville: client.city,
                adresse: client.address,
                code_postal: client.postCode,
                nom: client.lastName,
                prenom: client.firstName,
                designation: '',
            })
            .eq('numero_client', client.clientNumber)
            .select();

        if (addressError) {
            throw new Error(`Client address update failed: ${addressError.message}`);
        }

        return mapToType<Client>(clientDataRaw, clientKeyMap);
    }

    async readByClientNumber(id: number): Promise<Client> {
        const { data, error } = await this.supabase.from('clients').select('*, client_adresses(*), clubs:id_club_adherent(*), commandes(id, montant, date_creation, statut), devis(*)').eq('numero_client', id).single();
        if (error) throw new Error(`find by Id failed: ${error.message}`);
        return mapToType<Client>(data, clientKeyMap);
    }

    //Get All Clients
    async readAll(options: ClientFilter): Promise<ReturnAll<Client>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;

        let querySelect = '*, client_adresses(*), clubs:id_club_adherent(*), commandes(id, montant, date_creation, statut), devis(*)';

        const filterToApply: FilterMappingReturn[] = [];

        if (options.filters) {
            options.filters.forEach(filter => {
                const newFilter = clientFilter[filter.key as ClientFilterTypeAdmin](querySelect, filter);
                filterToApply.push(newFilter);
                querySelect = newFilter.query;
            });
        }

        const baseQuery = this.supabase
            .from('clients')
            .select(querySelect, { count: 'exact' })
            .range(startOffset, endOffset)
            .order('numero_client', { ascending: options.sort === 'asc' });

        // Search logic
        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                baseQuery.eq('numero_client', searchAsNumber);
            } else {
                baseQuery.or(
                    [
                        `prenom.ilike.%${options.search}%`,
                        `nom.ilike.%${options.search}%`,
                        `email.ilike.%${options.search}%`,
                    ].join(',')
                );
            }
        }

        // Advanced filter logic for "club_partenaire + club"
        let hasClubPartenaireType = false;
        let clubIds: string[] = [];

        filterToApply.forEach(filter => {
            if (filter.column === 'type' && filter.filterValues.includes(ClientType.CLUB_PARTENAIRE)) {
                hasClubPartenaireType = true;
            }
            if (filter.column === 'id_club_adherent') {
                clubIds = filter.filterValues;
            }
        });

        if (hasClubPartenaireType && clubIds.length > 0) {
            // Apply combined filter
            baseQuery
                .eq('type', ClientType.CLUB_PARTENAIRE)
                .in('id_club_adherent', clubIds);
        } else {
            // Apply filters as usual
            filterToApply.forEach(filter => {
                baseQuery.in(filter.column, filter.filterValues);
            });
        }

        const clients = await baseQuery;

        if (clients.error) {
            console.error("clients error: ", clients.error.message);
            throw new NotFoundError(clients.error.message);
        }

        return {
            items: clients?.data ? clients.data.map(client => mapToType<Client>(client, clientKeyMap)) : [],
            total: clients?.count ?? 0,
            count: clients?.data ? clients.data.length : 0,
        };
    }
    async deletAdressClient(id: number): Promise<void> {
        const { error } = await this.supabase
            .from("client_adresses")
            .delete()
            .eq("id", id);
        if (error) {
            throw new InternalServerError(error.message);
        }


    }
    async updatePasswordClient(client: passwordClientInput, userId: string): Promise<void> {
        const { data: userData, error: userError } = await this.supabase.auth.getUser();
        if (userError || !userData) throw new UnauthorizedError('User not authenticated');
        const userID = userData.user.id;

        const { error: authError } = await this.supabase.auth.updateUser({
            password: client.password

        })
        if (authError) {
            throw new InternalServerError(authError.message);
        }
    }
    async updateInformationClient(client: dataClientInput): Promise<Client> {
        const { data: userData, error: userError } = await this.supabase.auth.getUser();
        if (userError || !userData) throw new UnauthorizedError('User not authenticated');
        const userID = userData.user.id;

        const { data, error } = await this.supabase
            .from("clients")
            .update({
                nom: client.lastName,
                prenom: client.firstName,
                email: client.email,
                telephone_domicile: client.phone,
                telephone_portable: client.mobilePhone,
                date_naissance: client.birthDate ? client.birthDate.toISOString() : null
            })
            .eq('id_user', userID)
            .select('*')
            .single();
        if (error) {
            throw new InternalServerError(error.message);
        }

        const { error: authError } = await this.supabase.auth.updateUser({ email: client.email })
        if (authError) {
            throw new InternalServerError(authError.message);
        }


        return mapToType<Client>(data, clientKeyMap);
    }


    async anonymizeClientData(): Promise<Client> {
        const { data: userData, error: userError } = await this.supabase.auth.getUser();
        if (userError || !userData) throw new UnauthorizedError('User not authenticated');
        const userID = userData.user.id
        const anonEmail = `anonymous-${Date.now()}@nataquashop.com`;

        const { data: clientData, error: clientError } = await this.supabase
            .from("clients")
            .update({
                email: anonEmail,
                nom: 'Anonyme',
                prenom: 'Anonyme',
                telephone_domicile: '0000000000',
                telephone_portable: '0000000000',
                telephone_travail: '0000000000',
            })
            .eq("id_user", userID)
            .select('*')
            .single();
        if (clientError) {
            throw new InternalServerError(clientError.message);
        }

        const { error: addressError } = await this.supabase
            .from("client_adresses")
            .update({
                nom: 'Anonyme',
                prenom: 'Anonyme',
                adresse: 'Anonyme',
                adresse2: 'Anonyme',
                adresse3: 'Anonyme'

            })
            .eq("numero_client", clientData.numero_client)
            .select("*")
            .single();

        if (addressError) {
            throw new InternalServerError(addressError.message);
        }

        const { error: authError } = await this.supabase.auth.updateUser({ email: anonEmail })
        if (authError) {
            throw new InternalServerError(authError.message);

        }
        return mapToType<Client>(clientData, clientKeyMap);
    }
    async addFacturationAddress(address: FactAddressInput, client: Client): Promise<Address> {
        const { data, error } = await this.supabase
            .from("client_adresses")
            .insert({
                civilité: address.civility,
                prenom: address.firstName,
                nom: address.lastName,
                designation: address.designation,
                adresse: address.address,
                adresse2: address.complement,
                adresse3: address.building,
                code_postal: address.postalCode,
                ville: address.city,
                pays: address.country,
                societe: address.company,
                numero_client: client.clientNumber,

            }).select('*')
            .single();
        if (error) {
            throw new InternalServerError(error.message);
        }

        return mapToType<Address>(data, clientAddressKeyMap);
    }

    async updateAddress(address: defaultAddress): Promise<Address> {
        const { data, error } = await this.supabase
            .from('client_adresses')
            .update({
                defaut: address.default,
                adresse: address.address,
                code_postal: address.postalCode,
                ville: address.city,
                pays: address.country,
                designation: address.designation
            }).eq('id', address.id);

        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Address>(data, clientAddressKeyMap);
    }
    
    async getNumeroClientByUserId(userId: string): Promise<number> {
        const { data, error } = await this.supabase
            .from('clients')
            .select('numero_client')
            .eq('id_user', userId)
            .single();
             if (error) {
            throw new InternalServerError(error.message);
            
        }
        return data?.numero_client;
    }
    async resetDefaultAddresses(numberClient: number, excludeAddressId?: number): Promise<void> {
        const { error } = await this.supabase
            .from('client_adresses')
            .update({ defaut: false })
            .eq('numero_client', numberClient)
            .neq('id', excludeAddressId || '');
        if (error) {
            throw new InternalServerError(error.message);
        }
    }


}