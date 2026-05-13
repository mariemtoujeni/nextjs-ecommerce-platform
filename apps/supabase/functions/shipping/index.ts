import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { registerFunction, BodyResponse, ErrorCodes, DeliveryMode } from "../_shared/index.ts";

type BodyRequest = {
    mode_livraison: 'DOMICILE' | 'RELAIS' | 'MAGASIN';
    type_livraison: 'Express' | 'Standard';
    infos_relais: string;
    id_adresse?: number;
    id_adresse_facturation: number;
    pays: string;
}


type Adresse = {
    id_relais: string | null;
    societe: string;
    nom: string;
    prenom: string;
    adresse: string;
    adresse2: string;
    adresse3: string;
    code_postal: string;
    ville: string;
    pays: string;
}

const invalidateShipping = async ({userClient, userId}) => {
    await userClient.from('panier_livraison')
    .update({ valide: false })
    .eq('userId', userId);
}

registerFunction(async ({ req, userClient, adminClient, user}) => {

    const response: BodyResponse = { success: true };
    const body: BodyRequest = await req.json();

    const panier = await userClient.from('paniers').select('*, modeles(*)').eq('id_user', user.id);
    if(panier.error) {
        response.success = false;
        response.error = panier.error;
        await invalidateShipping({userClient, userId: user.id});
        return response;
    }

    let prixLivraison = 0;
    let delivery = DeliveryMode.MONDIAL_RELAY;
    const poids = panier.data.reduce((acc, p) => acc + (p.quantite * p.modeles.poids), 0);
    
    let adresse: Adresse = {
        id_relais: null,
        societe: '',
        nom: '',
        prenom: '',
        adresse: '',
        adresse2: '',
        adresse3: '',
        code_postal: '',
        ville: '',
        pays: '',
    }

    console.log('body ', body);
    console.log('poids ', poids);

    if(body.mode_livraison === 'MAGASIN') {
        delivery = DeliveryMode.AU_MAGASIN;
    } else {

        if(body.mode_livraison === 'DOMICILE') 
            delivery = body.type_livraison === 'Standard' ?  DeliveryMode.SO_COLISSIMO : DeliveryMode.CHRONOPOST;

        const deliveryZone = await adminClient.from('livraisons_view')
            .select('*')
            .eq('mode_livraison', delivery)
            .eq('pays', body.pays);

        console.log('deliveryZone ', deliveryZone.data);

        if(deliveryZone.error) {
            response.success = false;
            response.error = deliveryZone.error;
            await invalidateShipping({userClient, userId: user.id});
            return response;
        }

        const deliveryPrice = deliveryZone.data.find((z: any) => z.poids_min <= poids && z.poids_max > poids);

        console.log('deliveryPrice ', deliveryPrice);

        if(!deliveryPrice) {
            response.success = false;
            response.error = { message: ErrorCodes.AUCUNE_ZONE_DE_LIVRAISON };
            await invalidateShipping({userClient, userId: user.id});
            return response;
        }    

        const sans_tva = await adminClient.from('pays_sans_tva').select('*').eq('code', body.pays).single();

        if(sans_tva.data) {
            prixLivraison = deliveryPrice.prix;
        } else {
            prixLivraison = deliveryPrice.prix * 1.2;
        }        

        if("RELAIS" === body.mode_livraison) {
            const infosRelais = body.infos_relais.split(', ');
            adresse.id_relais = infosRelais[0];
            adresse.societe = infosRelais[1];
            adresse.adresse = infosRelais[2];
            adresse.adresse2 = infosRelais[3];
            adresse.code_postal = infosRelais[4];
            adresse.ville = infosRelais[5];
            adresse.pays = infosRelais[6];
            
        } else {
            const adresseLivraison = await adminClient.from('client_adresses').select('*').eq('id', body.id_adresse).single();
            if(adresseLivraison.error) {
                response.success = false;
                response.error = adresseLivraison.error;
                await invalidateShipping({userClient, userId: user.id});
                return response;
            }
        }
    }

    console.log('prixLivraison ', prixLivraison);
    

    const updatePanier = await userClient.from('panier_livraison').upsert({
        valide: true,
        id_user: user.id,
        mode_livraison: delivery,
        id_adresse_facturation: body.id_adresse_facturation,
        id_adresse: body.id_adresse ? body.id_adresse : null,
        poids,
        prix: prixLivraison,
        ...adresse
    })

    if(updatePanier.error) {
        response.success = false;
        response.error = updatePanier.error;
    }

    return response
});