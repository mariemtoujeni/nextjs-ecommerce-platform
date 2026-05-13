import { EmailType, mailDispatcher } from "../_shared/EmailFunctions.ts";
import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient, user}) => {
    const origin = req.headers.get('Origin');    

    if(!origin) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    if(!body.numero_client || !body.montant || !body.quantite ) {
        throw new Error(`Missing required data`);
    }

    const configuration_general = await userClient.from('configurations_generales').select('*').single();
    if(configuration_general.error) {
        throw new Error(configuration_general.error.message);
    }

    const client = await userClient.from('clients').select('*').eq('numero_client', body.numero_client).single();
    if(client.error) {
        throw new Error(client.error.message);
    }

    for(let i = 0; i < body.quantite; i++) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let codeChequeCadeau = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 15; i++) {
            codeChequeCadeau += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        // date de fin est éguale à la date d'aujourd'hui + la durée du chèque cadeau
        const now = new Date();
        const dateFin = new Date(now.setMonth(now.getMonth() + configuration_general.data.duree_validite_cheque_cadeau));
        const insert_cheque_cadeau = await userClient.from('cheque_cadeau').insert({
            numero_client: body.numero_client,
            montant: body.montant,
            code: codeChequeCadeau,                
            date_fin: dateFin,
            used: false
        });

        if(insert_cheque_cadeau.error) {
            return { success: false, error: insert_cheque_cadeau.error };
        }

        mailDispatcher[EmailType.EMAIL_ENVOYER_CHEQUE_CADEAU]([{
            code: codeChequeCadeau,
            montant: body.montant
        }], client);
    }

    return { success: true, data: { message: 'Cheque cadeau created successfully' } };
}, {
    allowOnlyAdmin: true
});