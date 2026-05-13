import { registerFunction } from "../_shared/index.ts";

const createTableOfCommande = (caisse: any, caisse_lignes: any) : string => {    
    const headers = [`N° ${caisse.id}`, `Mode de paiement : ${caisse.mode_paiement}`, "TVA", `${caisse_lignes.reduce((acc: number, curr: any) => acc + (curr.prix_ht ? (curr.prix_ht * curr.quantite ): (curr.prix - curr.prix * curr.tva / 100) * curr.quantite), 0)} €`, `${caisse_lignes.reduce((acc: number, curr: any) => acc + curr.prix * curr.quantite, 0)} €`].join(",");
    const rows = caisse_lignes.map((cl: any) => {
        return [
            `X ${cl.quantite}`,
            cl.intitule,
            cl.tva,
            (cl.prix_ht ? cl.prix_ht : (cl.prix / (1 + cl.tva / 100))) * cl.quantite,
            cl.prix * cl.quantite
        ].join(",");
    });
    const separator = ["", "", "", "", ""].join(",");
    return [headers, ...rows, separator].join("\n"); 
}

const totauxTable = (caisses: any, all_caisse_lignes: any) : string => {
    const headers = ["Paiement:", "CB", "CHEQUE", "VIREMENT", "TEL", "TOTAUX"];
    const lines: { [key: string]: any[] } = {
        "HT à 20": ["HT à 20", 0, 0, 0, 0, 0],
        "HT à 0": ["HT à 0", 0, 0, 0, 0, 0],
        "TOTAL HT": ["TOTAL HT", 0, 0, 0, 0, 0],
        "TVA à 20": ["TVA à 20", 0, 0, 0, 0, 0],
        "TVA à 0": ["TVA à 0", 0, 0, 0, 0, 0],
        "TOTAL TVA": ["TOTAL TVA", 0, 0, 0, 0, 0],
        "TOTAL TTC": ["TOTAL TTC", 0, 0, 0, 0, 0]
    };
    
    caisses.forEach((caisse: any) => {
        const commande_amounts = [ 
            caisse.mode_paiement === "CARTE" ? caisse.total : caisse.montant_cb, 
            caisse.mode_paiement === "CHEQUE" ? caisse.total : caisse.montant_cheque, 
            0, 
            caisse.mode_paiement === "ESPECE" ? caisse.total : caisse.montant_espece
        ];
        // filter caisse lignes
        const caisse_lignes = all_caisse_lignes.filter((cl: any) => cl.id_caisse === caisse.id);

        // Iterate lines to accordings to the headers we calculate the sum of commandes amounts
        for(const [key] of Object.entries(lines)) {                
            const sumValue = caisse_lignes.reduce((acc: number, curr: any) => {
                if(key === "HT à 20") {      
                    const p = curr.prix_ht ? curr.prix_ht * curr.quantite : (curr.prix / (1 + curr.tva / 100)) * curr.quantite;                    
                    return acc + (curr.tva === 20 ? p : 0);
                } else if(key === "HT à 0") {
                    return acc + (curr.tva === 0 ? curr.prix * curr.quantite : 0);
                } else if(key === "TOTAL HT") {
                    const p = curr.prix_ht ? curr.prix_ht * curr.quantite : (curr.prix / (1 + curr.tva / 100)) * curr.quantite;
                    return acc + p;
                } else if(key === "TVA à 20") {
                    const _tva = (curr.prix - (curr.prix / (1 + curr.tva / 100))) * curr.quantite;
                    return acc + (curr.tva === 20 ? _tva : 0);
                } else if(key === "TVA à 0") {
                    const _tva = (curr.prix - (curr.prix / (1 + curr.tva / 100))) * curr.quantite;
                    return acc + (curr.tva === 0 ? _tva : 0);
                } else if(key === "TOTAL TVA") {                    
                    const _tva = (curr.prix - (curr.prix / (1 + curr.tva / 100))) * curr.quantite;
                    return acc + _tva;
                } else if(key === "TOTAL TTC") {
                    return acc + (curr.prix * curr.quantite);
                }
            }, 0);
                    
            switch(caisse.mode_paiement)    {
                case "CARTE": {
                    lines[key][1] += sumValue;
                    break;
                }
                case "CHEQUE": {
                    lines[key][2] += sumValue;
                    break;
                }
                case "VIREMENT": {
                    lines[key][3] += sumValue;
                    break;
                }
                case "ESPECE": {
                    lines[key][4] += sumValue;
                    break;
                }
                case "MIXTE": {
                    if(sumValue < commande_amounts[0])  {
                        lines[key][1] += sumValue;
                    }   else if(sumValue < (commande_amounts[0] + commande_amounts[1])) {
                        lines[key][1] += commande_amounts[0];
                        lines[key][2] += sumValue - commande_amounts[0];
                    }   else if(sumValue < (commande_amounts[0] + commande_amounts[1] + commande_amounts[2])) {
                        lines[key][1] += commande_amounts[0];
                        lines[key][2] += commande_amounts[1];
                        lines[key][3] += sumValue - commande_amounts[0] - commande_amounts[1];
                    }   else {
                        lines[key][1] += commande_amounts[0];
                        lines[key][2] += commande_amounts[1];
                        lines[key][3] += commande_amounts[2];
                        lines[key][4] += sumValue - commande_amounts[0] - commande_amounts[1] - commande_amounts[2];
                    }
                }
            }
        }
    });
    // Calculate the total of the last line
    lines["HT à 20"][5] = lines["HT à 20"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);
    lines["HT à 0"][5] = lines["HT à 0"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);
    lines["TOTAL HT"][5] = lines["TOTAL HT"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);
    lines["TVA à 20"][5] = lines["TVA à 20"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);
    lines["TVA à 0"][5] = lines["TVA à 0"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);
    lines["TOTAL TVA"][5] = lines["TOTAL TVA"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);
    lines["TOTAL TTC"][5] = lines["TOTAL TTC"].slice(1, 5).reduce((acc, curr) => acc + curr, 0);

    // return the lines
    return [headers, ...Object.values(lines).map((line) => line.join(", "))].join("\n");
}

registerFunction(async ({ req, userClient, adminClient, user}) => {    
    const origin = req.headers.get('Origin');
  
    if(!origin || origin !== "https://technataqua.bubbleapps.io") {
        throw new Error("La requête doit provenir d'une origine autorisée");
    }

    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    if(!body.date_debut || !body.date_fin) {
        throw new Error("Date début et date fin sont obligatoires");
    }

    const caisses = await adminClient.from('caisses')
        .select("*")
        .gte("date_creation", new Date(body.date_debut).toISOString())
        .lte("date_creation", new Date(body.date_fin).toISOString());
    
    if(caisses.error) {
        throw new Error(`Erreur lors de la récupération des commandes: ${caisses.error.message}`);
    }

    const caisses_ligne = await adminClient.from('caisse_lignes')
        .select("*")
        .in("id_caisse", caisses.data.map((c: any) => c.id));
    if(caisses_ligne.error) {
        throw new Error(`Erreur lors de la récupération des commandes: ${caisses_ligne.error.message}`);
    }
    

    let csvContent = caisses.data.map((c: any) => {
        const caisse_lignes = caisses_ligne.data.filter((cl: any) => cl.id_caisse === c.id);
        return createTableOfCommande(c, caisse_lignes);
    }).join("\n");

    csvContent += ["", "", "", "", ""].join(",") + "\n";
    csvContent += ["", "", "", "", ""].join(",") + "\n";
    csvContent += ["", "", "", "", ""].join(",") + "\n";
    csvContent += totauxTable(caisses.data, caisses_ligne.data);

    // 3. Sauvegarder le CSV dans le file storage
    const fileName = `comptabilite/VENTES SITE DU -${Date.now()}.csv`;
    const { error: uploadError } = await adminClient.storage.from("comptabilite").upload(
      fileName,
      new File(["\ufeff"+csvContent], fileName, { type: "text/csv" }),
      { upsert: true }
    );

    // 4. Retourner le lien de téléchargement
    return { success: true, data: { url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/comptabilite/${fileName}` } };
})