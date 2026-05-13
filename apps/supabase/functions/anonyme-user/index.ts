import { BodyResponse, ErrorCodes, registerFunction } from "../_shared/index.ts"

registerFunction(async ({ req, userClient, adminClient, user}) => {
    const response: BodyResponse = { success: true };
    
    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    if(!body || !body.email) {
        response.success = false;
        response.error = ErrorCodes.EMAIL_IMPOSSIBLE;
        return response;
    }

    const email = body.email;
    // Update the user info selected by email
    const  updateResponse = await userClient.from('clients')
        .update({ 
            email: "non-compte@nataquashop.com",
            nom: `Anonyme`,
            prenom: `Anonyme`,
            telephone_domicile: '0000000000', 
            telephone_portable: '0000000000',
            telephone_travail: '0000000000',

        }).eq('email', email)
        .select('numero_client, id_user, nom, prenom, email, telephone_domicile, telephone_portable, telephone_travail')
        .single();

    if(updateResponse.error) {
        response.success = false;
        response.error = ErrorCodes.UPDATE_USER_ERROR;
        response.message = updateResponse.error.message
        return response;
    }

    const updateClientAdress = await userClient.from('client_adresses')
        .update({ 
            nom: `Anonyme`,
            prenom: `Anonyme`,
            adresse: 'Anonyme',
            adresse2: 'Anonyme',
            adresse3: 'Anonyme'
        }).eq('numero_client', updateResponse.data.numero_client);

    if(updateClientAdress.error) {
        response.success = false;
        response.error = ErrorCodes.UPDATE_USER_ERROR;
        response.message = updateClientAdress.error.message
        return response;
    }

    return {
        ...response,
        data: updateResponse.data
    };
});