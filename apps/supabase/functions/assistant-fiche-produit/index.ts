import OpenAI from "https://deno.land/x/openai@v4.67.3/mod.ts";
import { registerFunction } from "../_shared/index.ts";

export type ProductFeature = {
    model_name: string;
    color: string;
    price: number;
    size: string;
    weight: number;
    marque: string;
    category: string;
    material: string;
    otherInformation: string;
};

const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY') || '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',
});

// create openai thread
export const createThread = async () => {
    const emptyThread = await openai.beta.threads.create();
    return emptyThread;
};

// request openai assistant
export const requestAssistant = async (threadId: string, question: string) => {
    // retrieve the assistant by thread id
    const thread = await openai.beta.threads.retrieve(threadId);

    // send the feature to the assistant
    await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: question,
    });

    // get the assistant id
    const ass_id = Deno.env.get('ASSISTANT_ID') || 'asst_0pwi6v4RenyrK8BINTQ4cwN8';

    // create a thread runs
    let run = await openai.beta.threads.runs.create(thread.id, {        
        assistant_id: ass_id
    });
    let response = "";
    
    // loop until a response is returned
    while (true) {
       run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
       // if run status is completed 
        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            const assistantMessage = messages.data.filter(message => message.role === 'assistant');
            if (assistantMessage) {            
                response = assistantMessage.map(message => {
                    let text_content = "";
                    for(const c of message.content) {
                        if(c.type === "text")   {
                            text_content = text_content.concat(c.text.value)
                            break;
                        }
                    }
                    return text_content;
                }).join(' ');
            }
            break;
        }
        // Wait for a short period before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return response;
};


registerFunction(async ({ req, userClient }) => {
    const origin = req.headers.get('Origin');
    if(!origin) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    if (req.method === 'GET') {
        // create a new thread
        const thread = await createThread();
        return { success: true, threadId: thread.id };
    } else if (req.method === 'POST') {
        let body: any;
        const contentType = req.headers.get('Content-Type');
        if(contentType && contentType.includes('application/json')) {
            body = await req.json();
        } else {
            body = await req.formData();
        }

        const question = body.question;
        const idProduit = body.idProduit;
        const produit = await userClient.from('produits')
            .select("*, categories!inner(nom), sous_categories!inner(nom), marques!inner(nom)")
            .eq('id', idProduit)
            .single();

        const produitName = await userClient.from('produit_descriptions')
            .select('titre')
            .eq('id_produit', idProduit)
            .eq('lang', 'fr')
            .single();
        
        if(produit.error || produitName.error) {
            return { success: false, error: { message: 'Product not found' } };
        }
        const instructions = `Générer une fiche produit pour le produit nomé ${produitName.data.titre} de marque ${produit.data.marques.nom} de catégorie ${produit.data.categories.nom} et sous-catégorie ${produit.data.sous_categories.nom}
            ${produit.data.is_pack ? ". Il s'agit d'une produit pack" : ""} ${produit.data.personnalisation ? ". Ce produit pourrait être personnalisé" : ""}
            ${question.length > 0 ? `. Voici des informations suplémentaires qui devrait être prise en compte pour la génération de description: ${question}` : ""} .Rédide la description du produit en français.`;
        const threadIdFr = await createThread();
        const responseFR = await requestAssistant(threadIdFr.id, instructions);

        const instructionsEN = `Generate a product sheet for the product named ${produitName.data.titre} from the brand ${produit.data.marques.nom} in the category ${produit.data.categories.nom} and sub-category ${produit.data.sous_categories.nom}
            ${produit.data.is_pack ? ". This is a pack product" : ""} ${produit.data.personnalisation ? ". This product could be personalized" : ""}
            ${question.length > 0 ? `. Here are some additional information that should be taken into account for the description generation: ${question}` : ""} .Write the product description in English.`;
        const threadIdEn = await createThread();
        const responseEN = await requestAssistant(threadIdEn.id, instructionsEN);
        return { success: true, instruction: instructions, response: [{lang:'fr', description:responseFR},{lang:'en', description:responseEN}] };
    }

    return { success: false, error: { message: 'Invalid request method' } };
}, {
    allowOnlyAdmin: true
});