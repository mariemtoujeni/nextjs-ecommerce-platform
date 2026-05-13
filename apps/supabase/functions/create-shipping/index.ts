import { ICarrier, processMap } from "../_shared/CarrierInterface.ts";
import { Colissimo } from "../_shared/Colissimo.ts";
import { MondialRelay } from "../_shared/MondialRelay.ts";
import { DeliveryMode,  wichEnv,  BodyResponse, registerFunction, Environment } from "../_shared/index.ts";
import { Buffer } from "node:buffer";

type RequestBody = {
    ids: string
}

registerFunction(async ({ req, adminClient}) => {
    console.log('Creating shipping labels');
    const result: BodyResponse = { success: true, error: [] }


    const currentEnv = wichEnv(req.headers.get('Origin') || '');

    const body: RequestBody = await req.json();
    const ids = body.ids.split('_').map((id: string) => parseInt(id));

    const commandes = await adminClient.from('commandes').select('*, clients(*), commande_lignes(*, modeles(*)), commande_adresses(*), expeditions(*)').in('id' , ids);

    if(commandes.error) {
        console.error(commandes.error);
        result.error = commandes.error;
        return result;
    }

    for(const c of commandes.data) {

        console.log(`Commande ${c.id} - ${c.mode_livraison}`);

        try {
            // deno-lint-ignore no-explicit-any
            const areAllProductAvailable = c.commande_lignes.every((l: any) => l.disponible);

            if(!areAllProductAvailable) {
                throw new Error(`La commande contient des produits non disponibles`);
            }

            if('PAIEMENT_ACCEPTE' !== c.statut) {
                continue;
            }

            // deno-lint-ignore no-explicit-any
            const adresseFacturation = c.commande_adresses.find((a: any) => a.type === 'FACTURATION');
            // deno-lint-ignore no-explicit-any
            const adresseLivraison = c.commande_adresses.find((a: any) => a.type === 'LIVRAISON');

            if(!adresseFacturation || !adresseLivraison) {
                throw new Error(`Aucune adresse de facturation et/ou de livraison trouvée`);
            }

            const process = processMap[c.mode_livraison];
            if(!process) {
                throw new Error(`Mode de livraison non supporté ${c.mode_livraison}`);
            }

            const poids = c.commande_lignes.reduce((acc: number, l: any) => acc + l.modeles.poids, 0);

            const carrier = process(currentEnv);
            await carrier.init();
            const data = await carrier.createShippingLabel({
                id_commande: c.id,
                numero_client: c.clients.numero_client,
                poids: poids,
                livraison: {...adresseLivraison},
                facturation: {...adresseFacturation
                    , email: c.clients.email
                    , portable: c.clients.telephone_portable
                    , telephone: c.clients.telephone_domicile
                }
            });

            if(!data.label)
                throw new Error(`Erreur lors de la création de l'étiquette`);
            
            const b64 = Buffer.from(data.label).toString('base64');
            const pngRes = await fetch('http://pdf/to-png', { 
                body: JSON.stringify({ pdf: b64})
                , method: 'POST' 
                , headers: { 'Content-Type': 'application/json' }
            });

            if(!pngRes.ok) {
                console.error(await pngRes.text())
                console.error(pngRes.headers)
                throw new Error(`Erreur de conversion de l'étiquette`);
            }

            const png = await pngRes.arrayBuffer();

            const fileName = `${c.mode_livraison}/${data.trackingNumber}.png`;
            await adminClient.storage.from('livraisons').upload(fileName, png, { contentType: 'image/png' });

            const expeditions = await adminClient.from('expeditions').insert({
                id_commande: c.id,
                numero_suivis: data.trackingNumber,
                type : c.mode_livraison,
                etat: 'EN_PREPARATION',
                poids: c.poids,
                date_creation: new Date(),
                date_attente: null,
                date_expedition: null,
                etiquette: `livraisons/${fileName}`
            }).select('*').single();

            if(expeditions.error) {
                throw expeditions.error;
            }

            const expeditions_lignes = c.commande_lignes.map((l: any) => ({
                id_expedition: expeditions.data.id,
                id_modele: l.id_modele,
                quantite: 0,
                quantite_commande: l.quantite
            }));

            // deno-lint-ignore no-unused-vars
            const expLignesDb = await adminClient.from('expeditions_lignes').insert(expeditions_lignes);

            await adminClient.from('commandes').update({ statut: 'PREPARATION' }).eq('id', c.id);

        } catch(e) {
            console.error(e);
            result.error.push({id_commande: c.id, message: e.message});
            result.success = false && result.success;
        }
    }

    return result;
}, { allowOnlyAdmin: true });

