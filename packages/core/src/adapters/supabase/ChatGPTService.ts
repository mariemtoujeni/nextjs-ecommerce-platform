import { SupabaseClient } from "@supabase/supabase-js";
import { ChatGPTResponse, IIAService, TrainingData } from "../../services";
import { Product } from "../../models";
import { ReturnAll } from "../../types";
import OpenAI from "openai";

export class ChatGPTService implements IIAService {
    private supabase: SupabaseClient;
    private openai: OpenAI | null = null;
    private threadId: string | null = null;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    private getOpenAI(): OpenAI {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
            throw new Error('ChatGPTService cannot be used in browser environment');
        }

        // Check if API key is available
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        // Initialize OpenAI client lazily
        if (!this.openai) {
            this.openai = new OpenAI({
                apiKey: apiKey,
            });
        }

        return this.openai;
    }

    private async ensureThread(): Promise<string> {
        if (!this.threadId) {
            const openai = this.getOpenAI();
            const thread = await openai.beta.threads.create();
            this.threadId = thread.id;
        }
        return this.threadId;
    }

    async resetThread(): Promise<void> {
        this.threadId = null;
    }

    async setThread(threadId: string): Promise<void> {
        this.threadId = threadId;
    }

    getCurrentThreadId(): string | null {
        return this.threadId;
    }

    async createThread(): Promise<{threadId: string}> {
        const threadId = await this.ensureThread();
        return { threadId };
    }

    async generateDescription(threadId?: string, product?: Product): Promise<ChatGPTResponse[]> {
        if(product) {
            try {
                const openai = this.getOpenAI();
                
                // Use the provided threadId, existing thread, or create a new one
                if (threadId && threadId.trim() !== '') {
                    this.threadId = threadId;
                } else if (!this.threadId) {
                    this.threadId = await this.ensureThread();
                }
                
                // Validate threadId
                if (!this.threadId || this.threadId.trim() === '') {
                    throw new Error('Thread ID is required and cannot be empty');
                }

                // Try to retrieve the thread, but handle the case where it might not exist
                let thread;
                try {
                    thread = await openai.beta.threads.retrieve(this.threadId);
                } catch (error) {
                    // If thread doesn't exist, create a new one
                    console.warn(`Thread ${this.threadId} not found, creating new thread`);
                    thread = await openai.beta.threads.create();
                    this.threadId = thread.id;
                }

                // Validate that thread has an id
                if (!thread || !thread.id) {
                    throw new Error('Failed to create or retrieve thread with valid ID');
                }

                // Store thread ID in a local variable to avoid it becoming undefined
                const currentThreadId = thread.id;

                const ass_id = process.env.ASSISTANT_PRODUCT_DESCRIPTION_ID;
                if (!ass_id) {
                    throw new Error('ASSISTANT_PRODUCT_DESCRIPTION_ID environment variable is not set');
                }

                const responses: ChatGPTResponse[] = [];

                const attributesDescription = product.productAttributes?.map(attribut => attribut.values?.map(at2 => `${at2.attribute ? at2.attribute.name : attribut.name}: ${at2.name}`).join(', ')).join(', ');

                // Process each description using the same thread
                for (let i = 0; i < Math.min(2, product.descriptions.length); i++) {
                    const description = product.descriptions[i];
                    const lang = description?.lang || 'fr';                    
                    
                    let question = `Générer une description en langue ${lang === 'fr' ? 'français' : 'anglais'} formatée en html pour le produit suivant :
                    Le nom du produit: ${description?.title || product.descriptions[0]?.title}, de marque ${product.brand.name} appartenant à la catégorie ${product.category.name} 
                    et la sous catégorie ${product.subCategory?.name}, ${product.isPackage ? 'il s\'agit d\'un paquet' : 'il s\'agit d\'un produit individuel'},
                    le poids du produit est de ${product.weight} grammes.`;

                    if(attributesDescription) {
                        question += `Ce produit est disponible en ${attributesDescription}.`;
                    }

                    // send the question to the assistant
                    await openai.beta.threads.messages.create(currentThreadId, {
                        role: 'user',
                        content: question,
                    });

                    // create a thread run
                    let run = await openai.beta.threads.runs.create(currentThreadId, {        
                        assistant_id: ass_id
                    });

                    const run_id = run.id;
                    // wait for completion
                    while (true) {
                        if (!currentThreadId) {
                            throw new Error(`currentThreadId is undefined! Original value was: thread_tS12Jfrgrvk9EX6LL7OkViu0`);
                        }
                        
                        try {
                            run = await openai.beta.threads.runs.retrieve(
                                    run_id,
                                    {
                                        thread_id: currentThreadId
                                    }
                                );
                        } catch (retrieveError) {                            
                            throw retrieveError;
                        }
                        
                        if (run.status === 'completed') {
                            break;
                        } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
                            throw new Error(`Run failed with status: ${run.status}`);
                        }
                        
                        // Wait for a short period before checking again
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    // get the latest assistant message
                    const messages = await openai.beta.threads.messages.list(currentThreadId);
                    const latestAssistantMessage = messages.data
                        .filter(message => message.role === 'assistant')
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                    if (!latestAssistantMessage) {
                        throw new Error('No assistant message found');
                    }

                    // extract text content
                    let textContent = "";
                    for (const content of latestAssistantMessage.content) {
                        if (content.type === "text") {
                            const fullText = content.text.value;
                            
                            // Extract only HTML content from the response
                            const htmlMatch = fullText.match(/```html\s*([\s\S]*?)\s*```/);
                            if (htmlMatch && htmlMatch[1]) {
                                textContent = htmlMatch[1].trim();
                            } else {
                                // If no HTML block found, try to extract any HTML tags
                                const htmlTagsMatch = fullText.match(/<[^>]*>[\s\S]*?<\/[^>]*>/);
                                if (htmlTagsMatch) {
                                    textContent = htmlTagsMatch[0];
                                } else {
                                    // Fallback: extract any HTML content
                                    const htmlContentMatch = fullText.match(/<[^>]*>[\s\S]*?<\/[^>]*>|<[^>]*\/>/);
                                    if (htmlContentMatch) {
                                        textContent = htmlContentMatch[0];
                                    } else {
                                        // If no HTML found, use the full text
                                        textContent = fullText;
                                    }
                                }
                            }
                            break;
                        }
                    }

                    responses.push({
                        lang: lang,
                        content: textContent
                    });
                }

                return responses;
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error('not implemented');
        }   
    }

    async trainAssistant(products: Product[]): Promise<ReturnAll<TrainingData>> {
        const training_data: TrainingData[] = [];

        for (const product of products) {
            const descriptions = product.descriptions;
            for (const description of descriptions) {
                try {
                    const description_content = description?.description?.trim().replace(/\n/g, ' ').replace(/<[^>]*>/g, '').replace(/"/g, '"').replace(/\\/g, '\\\\') || '';
                    if(description_content.length === 0) {
                        continue;
                    }

                    const attributesDescription = product.productAttributes?.map(attribut => attribut.values?.map(at2 => `${at2.attribute ? at2.attribute.name : attribut.name}: ${at2.name}`).join(', ')).join(', ');

                    const instruction : string[] = [];
                    instruction.push(`Générer une description en langue ${description?.lang === 'fr' ? 'français' : 'anglais'} pour le produit suivant :`);
                    instruction.push(`Le nom du produit : ${description?.title || ''}, de marque ${product.brand?.name || ''}, appartenant à la catégorie ${product.category?.name || ''}`);
                    if (Array.isArray(product.collections) && product.collections.length > 0) {
                        instruction.push(`et à la collection ${product.collections.map((collection: { name?: string }) => collection?.name || '').join(', ')}`);
                    }
                    instruction.push(`${product.subCategory?.name ? `et la sous-catégorie ${product.subCategory.name}` : ''}, ${product.isPackage ? "il s'agit d'un paquet" : "il s'agit d'un produit individuel"},`);
                    if(product.weight) {
                        instruction.push(`le poids du produit est de ${product.weight} grammes.`); 
                    }
                    if(attributesDescription) {
                        instruction.push(`Ce produit est disponible en ${attributesDescription}.`);
                    }
                    instruction.push(`La description doit être courte et concise, ne pas dépasser 100 mots.`);
                    
                    const training_data_item: TrainingData = {
                        input: {
                            role: 'user',
                            content: instruction.join(' ')
                        },
                        preferred_output: {
                            role: 'assistant',
                            content: description_content
                        }
                    };                    
                    training_data.push(training_data_item);
                } catch (error) {
                    console.error('Error generating training data:', error);
                    continue;
                }
            }
        }
        
        // Check if training bucket exists
        try {
            const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets();
            if (bucketError) {
                console.error('Error listing buckets:', bucketError);
                throw bucketError;
            }
            
            const trainingBucket = buckets?.find(bucket => bucket.name === 'training');
            if (!trainingBucket) {
                console.error('Training bucket not found');
                throw new Error('Training bucket does not exist');
            }
        } catch (bucketCheckError) {
            console.error('Bucket check failed:', bucketCheckError);
            throw bucketCheckError;
        }
        
        const jsonData = JSON.stringify(training_data, null, 2);
        
        // Validate JSON before upload
        try {
            JSON.parse(jsonData);
        } catch (jsonError) {
            console.error('Invalid JSON data:', jsonError);
            throw new Error('Generated training data is not valid JSON');
        }
        
        const file = new File([jsonData], 'training_data.json', { type: 'application/json' });        
        try {
            const { data, error } = await this.supabase.storage.from('training').upload(
                'training_data.json', 
                file,
                { upsert: true }
            );
            
            if (error) {
                console.error('Supabase upload error:', error);
                throw error;
            }
            
        } catch (uploadError) {
            console.error('Upload failed:', uploadError);
            // Return the data even if upload fails
            return {
                items: training_data,
                error: uploadError instanceof Error ? uploadError.message : 'Upload failed',
                total: training_data.length,
                count: training_data.length
            };
        }    

        return {
            items: training_data,
            error: undefined,
            total: training_data.length,
            count: training_data.length
        };
    }
}