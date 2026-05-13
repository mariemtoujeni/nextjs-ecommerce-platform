import { CheckoutLine, CheckoutPresenter, PaymentMethod } from "../../models";
import { getInjection } from "../../types";

const createTableOfCommande = (caisse: CheckoutPresenter): string => {
    // Calculate total HT and total TTC from caisse.lines
    const totalHT = caisse?.lines?.reduce(
        (acc: number, curr: CheckoutLine) =>
            acc + ((curr.price / (1 + curr.VAT / 100)) * curr.quantity),
        0
    ) ?? 0;

    const totalTTC = caisse?.lines?.reduce(
        (acc: number, curr: CheckoutLine) =>
            acc + (curr.price * curr.quantity),
        0
    ) ?? 0;

    const headers = [
        `Numero: ${caisse.id}`,
        `Mode de paiement: ${caisse.paymentMethod}`,
        "TVA",
        `${totalHT.toFixed(2)} euro HT`,
        `${totalTTC.toFixed(2)} euro TTC`
    ].join(",");

    const rows = caisse?.lines?.map((cl: CheckoutLine) => {
        const prixHT = cl.price / (1 + cl.VAT / 100);
        return [
            `X ${cl.quantity}`,
            cl.name ?? "",
            cl.VAT ?? "",
            (prixHT * cl.quantity).toFixed(2),
            (cl.price * cl.quantity).toFixed(2)
        ].join(",");
    }) ?? [];
    const separator = ["", "", "", "", ""].join(",");
    return [headers, ...rows, separator].join("\n"); 
}

const totauxTable = (caisses: CheckoutPresenter[]) : string => {
    const headers = ["Paiement:", "CB", "CHEQUE", "VIREMENT", "TEL", "TOTAUX"];
    const linesSummaryTable: { [key: string]: any[] } = {
        "HT a 20": ["HT a 20", 0, 0, 0, 0, 0],
        "HT a 0": ["HT a 0", 0, 0, 0, 0, 0],
        "TOTAL HT": ["TOTAL HT", 0, 0, 0, 0, 0],
        "TVA a 20": ["TVA a 20", 0, 0, 0, 0, 0],
        "TVA a 0": ["TVA a 0", 0, 0, 0, 0, 0],
        "TOTAL TVA": ["TOTAL TVA", 0, 0, 0, 0, 0],
        "TOTAL TTC": ["TOTAL TTC", 0, 0, 0, 0, 0]
    };
    
    caisses.forEach((caisse: CheckoutPresenter) => {
        const commande_amounts : number[] = [ 
            caisse.paymentMethod === PaymentMethod.CREDIT_CARD ? Number(caisse.totalTTC) : Number(caisse.cbAmount), 
            caisse.paymentMethod === PaymentMethod.CHECK ? Number(caisse.totalHT) : Number(caisse.checkAmount), 
            0, 
            caisse.paymentMethod === PaymentMethod.CASH ? Number(caisse.totalHT) : Number(caisse.cashAmount)
        ];
        // filter caisse lignes
        const caisse_lignes = caisse.lines ?? [];

        // Iterate lines to accordings to the headers we calculate the sum of commandes amounts
        for(const [key] of Object.entries(linesSummaryTable)) {                
            const sumValue = caisse_lignes?.reduce((acc: number, curr: CheckoutLine) => {
                if(key === "HT a 20") {      
                    const p = curr.price / (1 + curr.VAT / 100) * curr.quantity;                    
                    return acc + (curr.VAT === 20 ? p : 0);
                } else if(key === "HT a 0") {
                    return acc + (curr.VAT === 0 ? curr.price * curr.quantity : 0);
                } else if(key === "TOTAL HT") {
                    const p = curr.price / (1 + curr.VAT / 100) * curr.quantity;
                    return acc + p;
                } else if(key === "TVA a 20") {
                    const _tva = (curr.price - (curr.price / (1 + curr.VAT / 100))) * curr.quantity;
                    return acc + (curr.VAT === 20 ? _tva : 0);
                } else if(key === "TVA a 0") {
                    const _tva = (curr.price - (curr.price / (1 + curr.VAT / 100))) * curr.quantity;
                    return acc + (curr.VAT === 0 ? _tva : 0);
                } else if(key === "TOTAL TVA") {                    
                    const _tva = (curr.price - (curr.price / (1 + curr.VAT / 100))) * curr.quantity;
                    return acc + _tva;
                } else if(key === "TOTAL TTC") {
                    return acc + (curr.price * curr.quantity);
                }
                return acc; // Ensure a number is always returned
            }, 0) ?? 0;

            if(caisse.paymentMethod === PaymentMethod.CREDIT_CARD || caisse.paymentMethod === PaymentMethod.DEBIT_CARD) {
                linesSummaryTable[key]?.[1] !== undefined && (linesSummaryTable[key][1] += Number(sumValue.toFixed(2)) ?? 0);
            } else if(caisse.paymentMethod === PaymentMethod.CHECK) {
                linesSummaryTable[key]?.[2] !== undefined && (linesSummaryTable[key][2] += Number(sumValue.toFixed(2)) ?? 0);
            } else if(caisse.paymentMethod === PaymentMethod.TRANSFER) {
                linesSummaryTable[key]?.[3] !== undefined && (linesSummaryTable[key][3] += Number(sumValue.toFixed(2)) ?? 0);
            } else if(caisse.paymentMethod === PaymentMethod.CASH) {
                linesSummaryTable[key]?.[4] !== undefined && (linesSummaryTable[key][4] += Number(sumValue.toFixed(2)) ?? 0);
            } else {
                if(commande_amounts[0] !== undefined && sumValue < commande_amounts[0])  {
                    linesSummaryTable[key]?.[1] !== undefined && (linesSummaryTable[key][1] += Number(sumValue.toFixed(2)) ?? 0);
                }   else if(commande_amounts[0] !== undefined && commande_amounts[1] !== undefined && sumValue < (commande_amounts[0] + commande_amounts[1])) {
                    linesSummaryTable[key]?.[1] !== undefined && (linesSummaryTable[key][1] += Number(commande_amounts[0].toFixed(2)));
                    linesSummaryTable[key]?.[2] !== undefined && (linesSummaryTable[key][2] += Number((sumValue - commande_amounts[0]).toFixed(2)));
                }   else if(commande_amounts[0] !== undefined && commande_amounts[1] !== undefined && commande_amounts[2] !== undefined && 
                        sumValue < (commande_amounts[0] + commande_amounts[1] + commande_amounts[2])) {
                    linesSummaryTable[key]?.[1] !== undefined && (linesSummaryTable[key][1] += Number(commande_amounts[0].toFixed(2)));
                    linesSummaryTable[key]?.[2] !== undefined && (linesSummaryTable[key][2] += commande_amounts[1].toFixed(2));
                    linesSummaryTable[key]?.[3] !== undefined && (linesSummaryTable[key][3] += (sumValue - commande_amounts[0] - commande_amounts[1]).toFixed(2));
                }   else if(commande_amounts[0] !== undefined && commande_amounts[1] !== undefined && commande_amounts[2] !== undefined ) {
                    linesSummaryTable[key]?.[1] !== undefined && (linesSummaryTable[key][1] += Number(commande_amounts[0].toFixed(2)));
                    linesSummaryTable[key]?.[2] !== undefined && (linesSummaryTable[key][2] += Number(commande_amounts[1].toFixed(2)));
                    linesSummaryTable[key]?.[3] !== undefined && (linesSummaryTable[key][3] += Number(commande_amounts[2].toFixed(2)));
                    linesSummaryTable[key]?.[4] !== undefined && (linesSummaryTable[key][4] += Number((sumValue - commande_amounts[0] - commande_amounts[1] - commande_amounts[2]).toFixed(2)));
                }
            }
        }
    });
    // Calculate the total of the last line
    linesSummaryTable["HT a 20"]?.[5] !== undefined && (linesSummaryTable["HT a 20"][5] = linesSummaryTable["HT a 20"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));
    linesSummaryTable["HT a 0"]?.[5] !== undefined && (linesSummaryTable["HT a 0"][5] = linesSummaryTable["HT a 0"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));
    linesSummaryTable["TOTAL HT"]?.[5] !== undefined && (linesSummaryTable["TOTAL HT"][5] = linesSummaryTable["TOTAL HT"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));
    linesSummaryTable["TVA a 20"]?.[5] !== undefined && (linesSummaryTable["TVA a 20"][5] = linesSummaryTable["TVA a 20"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));
    linesSummaryTable["TVA a 0"]?.[5] !== undefined && (linesSummaryTable["TVA a 0"][5] = linesSummaryTable["TVA a 0"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));
    linesSummaryTable["TOTAL TVA"]?.[5] !== undefined && (linesSummaryTable["TOTAL TVA"][5] = linesSummaryTable["TOTAL TVA"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));
    linesSummaryTable["TOTAL TTC"]?.[5] !== undefined && (linesSummaryTable["TOTAL TTC"][5] = linesSummaryTable["TOTAL TTC"].slice(1, 5).reduce((acc, curr) => acc + Number(curr), 0).toFixed(2));

    // return the lines
    return [headers, ...Object.values(linesSummaryTable).map((line: any) => line.join(", "))].join("\n");
}

export const exportAccountingCheckoutsUseCase = async (dateDebut: string, dateFin: string): Promise<string> => {
    const checkoutRepository = await getInjection('ICheckoutRepository');
    const checkouts = await checkoutRepository.readCheckoutByDateInterval(new Date(dateDebut), new Date(dateFin));

    let csvContent = checkouts.map((checkout: CheckoutPresenter) => createTableOfCommande(checkout)).join("\n");
    csvContent += ["", "", "", "", ""].join(",") + "\n";
    csvContent += ["", "", "", "", ""].join(",") + "\n";
    csvContent += ["", "", "", "", ""].join(",") + "\n";
    csvContent += totauxTable(checkouts);

    const storageService = await getInjection('IStorageService');
    const url = await storageService.uploadCsvFile(
        csvContent, 
        `comptabilite/VENTES CAISSE-${Date.now()}.csv`
    );

    return url;
}