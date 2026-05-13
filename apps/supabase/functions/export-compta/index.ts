import { registerFunction } from "../_shared/index.ts";

// Fonction pour convertir les données en CSV
const convertToCSV = (headers: string[], data: any) : string => {
    const header = headers.join(","); // Obtenir les en-têtes
    const rows = data.map((cmd : any) => {
        return [
            "VT",
            cmd.date_creation.split("T")[0],
            cmd.clients.id_club ? cmd.clients.id_club : cmd.clients.numero_client,
            cmd.id,
            "",
            "",
            "",
            cmd.montant,
            "",
            cmd.date_creation.split("T")[0],
            cmd.clients.id_club ? cmd.clients.clubs.nom : `${cmd.clients.prenom} ${cmd.clients.nom}`,
            ""
        ].join(","); // Générer une ligne de CSV
    }); // Générer les lignes
    return [header, ...rows].join("\n"); // Combiner en une seule chaîne CSV
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

    const commandeReq = await adminClient.from('commandes')
        .select("*, clients!inner(*, clubs!id_club(*))")
        .gte("date_creation", new Date(body.date_debut).toISOString())
        .lte("date_creation", new Date(body.date_fin).toISOString());

    if(commandeReq.error) {
        throw new Error(`Erreur lors de la récupération des commandes: ${commandeReq.error.message}`);
    }

    const headers = ["JournalCode", "EcritureDate", "CompteNum", "EcritureLib", 
        "Piece 1", "Piece 2", "Montant", "Sens", "Auxiliaire", 
        "DateEcheance", "LibelleCompte", "CodeLettrage"];

    const csvContent = convertToCSV(headers, commandeReq.data);

    // 3. Sauvegarder le CSV dans le file storage
    const fileName = `comptabilite/modeles ventes-${Date.now()}.csv`;
    const { error: uploadError } = await adminClient.storage.from("comptabilite").upload(
      fileName,
      new File([csvContent], fileName, { type: "text/csv" }),
      { upsert: true }
    );

    if (uploadError) {
        throw new Error("Erreur lors de l'upload du fichier dans le file storage supabase");
    }

    // 4. Retourner le lien de téléchargement
    return { success: true, data: { url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/comptabilite/${fileName}` } };
}, { allowOnlyAdmin: true })