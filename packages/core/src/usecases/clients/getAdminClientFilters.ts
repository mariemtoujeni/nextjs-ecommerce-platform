import { GenericFilter, getInjection } from "@repo/core/types";
import { ClientFilterTypeAdmin, ClientType } from "@repo/core/models";

const filterFetch: Record<ClientFilterTypeAdmin, () => Promise<GenericFilter>> = {
    // [ClientFilterTypeAdmin.CITY]: async () => {
    //     const clientRepository = await getInjection('IClientRepository');
    //     const clientAddresses = await clientRepository.getListAddress({def: true, limit:200});

    //     const uniqueCitiesMap = new Map<string, { id: string; name: string }>();

    //     clientAddresses.forEach(address => {
    //         if (address.ville && address.ville.trim() !== '') {
    //             const city = address.ville.trim();
    //             uniqueCitiesMap.set(city, { id: city, name: city });
    //         }
    //     });

    //     return {
    //         key: ClientFilterTypeAdmin.CITY,
    //         text: "Ville",
    //         values: Array.from(uniqueCitiesMap.values())
    //     };
    // },


    [ClientFilterTypeAdmin.MEMBRE_CLUB]: async () => {
        const clientRepository = await getInjection('IClientRepository');
        const clubs = await clientRepository.readAllPartnerClubs();

        return { key: ClientFilterTypeAdmin.MEMBRE_CLUB, text: `Adhérent d’un club (${clubs.count})`, values: clubs.items.map(club => ({id: club.id, name: club.name}))};
    },
    // [ClientFilterTypeAdmin.POST_CODE]: async () => {
    //     const clientRepository = await getInjection('IClientRepository');
    //     const clientAdresses = await clientRepository.getListAddress();
    //     const uniquePostCodes = Array.from(
    //         new Map( clientAdresses
    //                 .filter(adr => adr.city) 
    //                 .map(adr => [adr.city, { id: adr.city, name: adr.city }])).values());
    //     return {key: ClientFilterTypeAdmin.POST_CODE, text: "Code postal"
    //         , values: uniquePostCodes};
    // },
    [ClientFilterTypeAdmin.TYPE]: async () => ({key: ClientFilterTypeAdmin.TYPE, text: "Type"
        , values: [
            {id: ClientType.CLIENT, name: "Client"},
            {id: ClientType.CLUB, name: "Club"},
            {id: ClientType.CLUB_PARTENAIRE, name: "Club partenaire"},
        ]}),
}

export const getAdminClientFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}


