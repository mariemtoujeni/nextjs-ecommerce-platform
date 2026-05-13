import { registerFunction, computeFidelityDiscount } from "../_shared/index.ts";
import * as base64 from "jsr:@std/encoding/base64";
import { computeTotalReduction, getReductionCodePromo } from "../_shared/ReductionFunctions.ts";

const systemPayAuth = {
    'https://nataquashop.bubbleapps.io' : base64.encodeBase64("88964087:testpassword_aNwtmkWrDoqvZZiiELV3QhkzV56tjrj82WQL7ZprdKEii"),
    prod : ""
}

const systemPayUrl = 'https://api.systempay.fr/api-payment/V4/Charge/CreatePayment'

registerFunction(async ({ req, userClient, adminClient, user}) => {

    const origin = req.headers.get('Origin');
    const auth = systemPayAuth[origin as keyof typeof systemPayAuth];

    if(!origin || ! auth) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    const panier = await userClient.from('paniers').select('*, modeles(*)').eq('id_user', user.id);
    const panier_livraison = await userClient.from('panier_livraison').select('*').eq('id_user', user.id).maybeSingle();
    const panier_reduction = await userClient.from('panier_reduction').select('*').eq('id_user', user.id).maybeSingle();
    const client = await userClient.from('clients').select('numero_client').eq('id_user', user.id).single();

    if(panier.error || panier_livraison.error || client.error || panier_reduction.error) {
        return { success: false, error: panier.error || panier_livraison.error || client.error || panier_reduction.error || {} };
    }
    
    
    const adresseFacturation = await userClient.from('client_adresses').select('*').eq('id', panier_livraison.data.id_adresse_facturation).single();
    const codePays = adresseFacturation.data.pays;

    const sans_tva = await adminClient.from('pays_sans_tva').select('*').eq('code', codePays).single();
    const tvaApplicable = undefined === sans_tva.data || null === sans_tva.data;
    console.log(`tva applicable ${tvaApplicable} pour ${codePays} ${sans_tva.data}`);

    // calculs avec les réductions
    const montantPanierHT = panier.data.reduce((acc: number, p: any) => acc + (p.quantite * p.modeles.prix_vente_ht) + (p.personnalisation ? p.prix / 1.2 : 0), 0);
    const montantPanierTTC = panier.data.reduce((acc: number, p: any) => {
        const prix = tvaApplicable ? p.modeles.prix_vente_ttc : p.modeles.prix_vente_ht;
        return acc + (p.quantite * prix) + (p.personnalisation ? p.prix : 0);
    }, 0);


    let finalAmount = montantPanierTTC + panier_livraison.data.prix;
    let reductionAmount = 0;

    if(panier_reduction.data) {
        if("MONTANT" == panier_reduction.data.type_valeur_reduction) {
            reductionAmount = panier_reduction.data.valeur_reduction
            finalAmount = Math.max(0, finalAmount - reductionAmount);
        } else {
            reductionAmount = Math.max(finalAmount, finalAmount * panier_reduction.data.valeur_reduction / 100);
            finalAmount = finalAmount - reductionAmount;
        }
    }

    const createPayment = await fetch(systemPayUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
            amount: Math.floor(finalAmount * 100),
            currency: "EUR",
            customer: {
                reference: user.id,
            }
        })
    });

    if(!createPayment.ok) {
        return { success: false, error: { message: createPayment.statusText } };
    }

    const data = await createPayment.json();  

    return { success: true, data: { 
        formToken : data.answer.formToken,
        montant_ht: montantPanierHT,
        montant_ttc: montantPanierTTC,
        montant_livraison: panier_livraison.data.prix,
        montant_reduction: reductionAmount,
        tva_applicable: tvaApplicable,
        total: finalAmount
    } };
});