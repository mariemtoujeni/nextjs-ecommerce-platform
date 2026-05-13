import { GenericFilter } from "../../../types";
import { AdminOrderFilterType, OrderBoutique, OrderDevis, OrderModeLivraison, OrderStatus } from "../../../models";

const filterFetch: Record<AdminOrderFilterType, () => Promise<GenericFilter>> = {
    [AdminOrderFilterType.STATUS]: async () => {
        return {
            key: AdminOrderFilterType.STATUS,
            text: "Statut",
            values: [
                { id: OrderStatus.ATTENTE_ACCEPTATION_DEVIS, name: "En attente d'acceptation" },
                { id: OrderStatus.ATTENTE_PAIMENT, name: "En attente de paiement" },
                { id: OrderStatus.PAIMENT_ACCEPTE, name: "Paiement accepté" },
                { id: OrderStatus.PREPARATION, name: "En préparation" },
                { id: OrderStatus.EXPEDIEE_PARTIELLEMENT, name: "Expédié partiellement" },
                { id: OrderStatus.EXPEDIEE, name: "Expédié" },
                { id: OrderStatus.AUTRE_1, name: "Autre 1" },
                { id: OrderStatus.AUTRE_2, name: "Autre 2" },
            ]
        }
    },
    [AdminOrderFilterType.BOUTIQUE]: async () => {
        return {
            key: AdminOrderFilterType.BOUTIQUE,
            text: "Boutique",
            values: [
                { id: OrderBoutique.NATAQUASHOP, name: "Nataquashop" },
                { id: OrderBoutique.SWIMWEAR, name: "Swimwear" },
                { id: OrderBoutique.CRAZYSWIM, name: "Crazy Swim" }
            ]
        }
    },
    [AdminOrderFilterType.MODE_LIVRAISON]: async () => {
        return {
            key: AdminOrderFilterType.MODE_LIVRAISON,
            text: "Mode de livraison",  
            values: [
                { id: OrderModeLivraison.COLISSIMO, name: "Colissimo" },
                { id: OrderModeLivraison.SO_COLISSIMO, name: "So Colissimo" },
                { id: OrderModeLivraison.CHRONOPOST, name: "Chronopost" },
                { id: OrderModeLivraison.CHRONOPOST_RELAIS, name: "Chronopost Relais" },
                { id: OrderModeLivraison.AU_MAGASIN, name: "Au magasin" },
                { id: OrderModeLivraison.AU_CLUB, name: "Au club" },
                { id: OrderModeLivraison.NON_LIVRABLE, name: "Non livrable" },
                { id: OrderModeLivraison.MANUEL, name: "Manuel" },
                { id: OrderModeLivraison.EXPEDITOR, name: "Expeditor" },
                { id: OrderModeLivraison.MONDIAL_RELAIS, name: "Mondial Relais" },
                { id: OrderModeLivraison.EXAPAQ, name: "Exapaq" },
                { id: OrderModeLivraison.ICI_RELAIS, name: "Ici Relais" }
            ]
        }
    },
    [AdminOrderFilterType.DEVIS]: async () => {
        return {
            key: AdminOrderFilterType.DEVIS,    
            text: "Devis",
            values: [
                { id: OrderDevis.OUI, name: "Oui" },
                { id: OrderDevis.NON, name: "Non" }
            ]
        }
    }
}

export const getAdminOrderFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filters;
}