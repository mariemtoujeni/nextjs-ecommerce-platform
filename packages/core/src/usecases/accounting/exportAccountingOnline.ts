import { NumeroCompteCrazyswim, NumeroCompteNataquashop, NumeroCompteSwimwear } from "../../models";
import { getInjection } from "../../types";

const convertToCSV = (headers: string[], commandes: any[], creditNotes: any[]) : string => {
    const header = headers.join(","); // Obtenir les en-têtes
    const rows = commandes.map((cmd : any, index: number) => {        
        const commandeLines = cmd.lines.map((line : any) => {
            let compteNumVente = "";
            let compteNumTVA = "";
            let compteNumVenteSansTVA = "";    
            let operationLabel = "";        
            let tvaLabel = "";
            let withoutTVALabel = "VENTE SITE";            
            if(cmd.boutique.toLowerCase() === "nataquashop") {  
                if(!cmd.client.clubId) {
                    if(cmd.paymentMode.toLowerCase() === "systempay") {
                        compteNumVente = NumeroCompteNataquashop.CLIENT_CB;
                        operationLabel = "Vente CB NataquaShop";
                    } else if(cmd.paymentMode.toLowerCase() === "cheque") {
                        compteNumVente = NumeroCompteNataquashop.CLIENT_CHEQUE;
                        operationLabel = "Vente chèque NataquaShop";
                    } else if(cmd.paymentMode.toLowerCase() === "virement") {
                        compteNumVente = NumeroCompteNataquashop.CLIENT_VIREMENT;
                        operationLabel = "Vente virement NataquaShop";
                    } else {
                        operationLabel = `Vente ${cmd.paymentMode}`;
                    }

                    if(line.vat === 20) {
                        compteNumTVA = NumeroCompteNataquashop.TVA_20;
                        compteNumVenteSansTVA = NumeroCompteNataquashop.VENTE_DU_SITE_20;
                        tvaLabel = "TVA COLLECTE 20%";
                    } else {
                        compteNumTVA = NumeroCompteNataquashop.TVA_5_5;
                        compteNumVenteSansTVA = NumeroCompteNataquashop.VENTE_DU_SITE_0;
                        tvaLabel = "TVA COLLECTE 5,5%";
                    }
                } else {
                    if(line.vat === 20) {
                        compteNumTVA = NumeroCompteNataquashop.TVA_20;
                        compteNumVenteSansTVA = NumeroCompteNataquashop.VENTE_DU_CLUBS_20;
                    } else {
                        compteNumTVA = NumeroCompteNataquashop.TVA_5_5;                        
                    }

                    compteNumVente = `411${cmd.client.club.name.replaceAll(" ", "")}`;
                    operationLabel = "Vente Club";

                    if(line.giftVoucher)    {
                        compteNumVenteSansTVA = NumeroCompteNataquashop.VENTE_DU_CLUBS_CHEQUE_CADEAU;
                    }             
                }
            } else if(cmd.boutique.toLowerCase() === "swimwear") {
                if(cmd.paymentMode.toLowerCase() === "systempay") {
                    compteNumVente = NumeroCompteSwimwear.CLIENT_CB;
                } else if(cmd.paymentMode.toLowerCase() === "cheque") {
                    compteNumVente = NumeroCompteSwimwear.CLIENT_CB;
                } else if(cmd.paymentMode.toLowerCase() === "virement") {
                    compteNumVente = NumeroCompteSwimwear.CLIENT_VIREMENT;
                }

                if(line.vat === 20) {
                    compteNumTVA = NumeroCompteSwimwear.TVA_20;
                    compteNumVenteSansTVA = NumeroCompteSwimwear.VENTE_DU_SITE_20;
                }
            } else if(cmd.boutique.toLowerCase() === "crazyswim") {
                compteNumVente = NumeroCompteCrazyswim.CLIENT_CB;
            }            
            const arrayToReturn = [
                [
                    "VE",
                    cmd.createdAt ? new Date(cmd.createdAt).toISOString().slice(0,10).replace(/-/g, "") : "",
                    compteNumVente,
                    operationLabel,
                    cmd.id,
                    `${cmd.client.firstName} ${cmd.client.lastName}`,
                    line.totalPriceInclTax.toFixed(2),
                    "",
                    operationLabel,
                    ""
                ].join(","),
                [
                    "VE",
                    cmd.createdAt ? new Date(cmd.createdAt).toISOString().slice(0,10).replace(/-/g, "") : "",
                    compteNumVenteSansTVA,
                    tvaLabel,
                    cmd.id,
                    `${cmd.client.firstName} ${cmd.client.lastName}`,
                    "",
                    (line.totalPriceInclTax - line.totalPriceExclTax).toFixed(2),
                    tvaLabel,
                    ""
                ].join(","),
                [
                    "VE",
                    cmd.createdAt ? new Date(cmd.createdAt).toISOString().slice(0,10).replace(/-/g, "") : "",
                    compteNumTVA,
                    withoutTVALabel,
                    cmd.id,
                    `${cmd.client.firstName} ${cmd.client.lastName}`,
                    "",
                    line.totalPriceExclTax.toFixed(2),
                    withoutTVALabel,
                    ""
                ].join(",")
            ]; // Générer une ligne de CSV
            return arrayToReturn;
        }); // Générer les lignes
        return commandeLines.flat();         
    }); 

    const rowsCreditNotes = creditNotes.map((creditNote : any) => {
        const creditNoteLines = creditNote.lines.map((line : any) => {
            const arrayToReturn = [
                [
                    "VE",
                    creditNote.createdAt ? new Date(creditNote.createdAt).toISOString().slice(0,10).replace(/-/g, "") : "",
                    NumeroCompteNataquashop.REMBOURSEMENT,
                    "Remboursements clients",
                    creditNote.id,
                    `${creditNote.order.client.clubId ? creditNote.order.client.club.name : creditNote.order.client.firstName} ${creditNote.order.client.clubId ? '' : creditNote.order.client.lastName}`,
                    (line.priceExcludingTax + line.priceExcludingTax * line.vatRate / 100).toFixed(2),
                    "",
                    "Remboursements clients",
                    ""
                ].join(","),
                [
                    "VE",
                    creditNote.createdAt ? new Date(creditNote.createdAt).toISOString().slice(0,10).replace(/-/g, "") : "",
                    line.vatRate === 20 ? NumeroCompteNataquashop.TVA_20 : NumeroCompteNataquashop.TVA_5_5,
                    `${line.vatRate === 20 ? "Tva collectée 20% " : "Tva collectée 5,5%"}`,
                    creditNote.id,
                    `${creditNote.order.client.clubId ? creditNote.order.client.club.name : creditNote.order.client.firstName} ${creditNote.order.client.clubId ? '' : creditNote.order.client.lastName}`,
                    "",
                    (line.priceExcludingTax * line.vatRate / 100).toFixed(2),                    
                    `${line.vatRate === 20 ? "Tva collectée 20% " : "Tva collectée 5,5%"}`,
                    ""
                ].join(","),
                [
                    "VE",
                    creditNote.createdAt ? new Date(creditNote.createdAt).toISOString().slice(0,10).replace(/-/g, "") : "",
                    line.vatRate === 20 ? NumeroCompteNataquashop.VENTE_DU_SITE_20 : NumeroCompteNataquashop.VENTE_DU_SITE_0,
                    `${line.vatRate === 20 ? creditNote.order.client.clubId ? "Ventes clubs 20%" : "Ventes du site 20%" : creditNote.order.client.clubId ? "Ventes clubs 5,5%" : "Vente du site 5,5%"}`,
                    creditNote.id,
                    `${creditNote.order.client.clubId ? creditNote.order.client.club.name : creditNote.order.client.firstName} ${creditNote.order.client.clubId ? '' : creditNote.order.client.lastName}`,
                    "",
                    line.priceExcludingTax.toFixed(2),
                    "",
                    `${line.vatRate === 20 ? creditNote.order.client.clubId ? "Ventes clubs 20%" : "Ventes du site 20%" : creditNote.order.client.clubId ? "Ventes clubs 5,5%" : "Vente du site 5,5%"}`,
                    ""
                ].join(",")
            ];
            return arrayToReturn;
        });
        return creditNoteLines.flat();
    });
    const flatRowsCmd = rows.flat();
    const flatRowsCreditNotes = rowsCreditNotes.flat();
    const csv = [header, ...flatRowsCmd, ...flatRowsCreditNotes].join("\n");
    return csv;
}

export const exportAccountingOnlineUseCase = async (dateDebut: string, dateFin: string): Promise<string> => {
    const orderRepository = await getInjection('IOrderRepository');
    const orders = await orderRepository.readAllOrderPresenter({
        startDate: new Date(dateDebut),
        endDate: new Date(dateFin)
    });

    const creditNoteRepository = await getInjection('ICreditNoteRepository');
    const creditNotes = await creditNoteRepository.readAll({
        startDate: new Date(dateDebut),
        endDate: new Date(dateFin)
    });

    const headers = ["JournalCode", "EcritureDate", "CompteNum", "EcritureLib", 
        "Piece 1", "Piece 2", "Debit", "Credit", "LibelleCompte", "CodeLettrage"];

    const csv = convertToCSV(headers, orders.items, creditNotes.items);
    
    const storageService = await getInjection('IStorageService');
    const url = await storageService.uploadCsvFile(csv, `comptabilite/modeles ventes-${Date.now()}.csv`);
    return url;
}