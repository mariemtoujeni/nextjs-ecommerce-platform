import { Environment, registerFunction } from "../_shared/index.ts";

type RequestBody = {
    action: 'create' | 'update' | 'delete';
    email: string;
    nom?: string;
    prenom?: string;
    role?: string;
}


const env = Deno.env.get('ENVIRONMENT')! as Environment || Environment.TEST;
const redirectToUrls = {
    [Environment.TEST]: 'https://technataqua.bubbleapps.io/version-test/invite',
    [Environment.PROD]: 'https://admin.nataquashop.com/invite'
}

registerFunction(async ({ req, adminClient }) => {
    const body: RequestBody = await req.json();


    switch (body.action) {
        case "create": 
        {
            const splittedEmail = body.email.split('@');
            if(     "nataquashop.com" !== splittedEmail[1]
                &&  "squaad.io" !== splittedEmail[1]) 
            {
                throw new Error("Domaine de l'email invalide")
            }

            const findUser: any = await adminClient.rpc("get_user_id_by_email", {email: body.email}).single()
            let userId = '';

            if(!findUser.data) {
                const redirectTo = redirectToUrls[env];
                const {data, error} = await adminClient.auth.admin.inviteUserByEmail(body.email, {data: {is_admin: true}, redirectTo});
                if (error) {
                    throw new Error(error.message)
                }
                userId = data.user.id;
            } else {
                userId = findUser.data.id;
            }

            const insert = await adminClient.from("permissions").insert({
                role: body.role,
                id: userId,
                nom: body.nom,
                prenom: body.prenom,
                email: body.email
            });

            if(insert.error) {
                throw new Error(insert.error.message)
            }
        }
        break;
        case "update":
        {            
            await adminClient.from("permissions").update({
                role: body.role,
            }).eq("email", body.email);
        }
        break;
        case "delete":
        {
            const findUser: any = await adminClient.rpc("get_user_id_by_email", {email: body.email}).single()
            
            await adminClient.from("permissions").delete().eq("email", body.email);

            if(findUser.data) {
                await adminClient.auth.admin.deleteUser(findUser.data.id);
            }
        }
        break;
        default:
            throw new Error("Action invalide")
    }

    return {success: true}
}, {allowOnlyAdmin: true});