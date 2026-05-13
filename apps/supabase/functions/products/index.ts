// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/index.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const originMap = {
    "https://nataquashop.bubbleapps.io": 1
}

Deno.serve(async (req) => {

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { ...corsHeaders }, status: 200 })
    }
    
    // TODO : vérifier origin pour aller récupérer les produits pubklié sur le site correspondant
    const origin = req.headers.get('Origin');

    const auth = req.headers.get('Authorization')
    const { categorie, sous_categorie, collection, magasin, page, count } = await req.json();

    const start = page ? page : 1;
    const nbElement = count ? count : 10;
    
    if ("" === auth || !auth) {
        return new Response(undefined, { headers: { ...corsHeaders }, status: 200 })
    }

    const client = createClient(
          Deno.env.get('SUPABASE_URL')!
        , Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        , { global: { headers: { Authorization: auth } } }
    );

    try {
        const query = client.from('produits').select(`id, id_categorie, id_sous_categories, id_marque, prix_vente_ht, tva
            , magasins!inner(id, nom), categories(id, nom), sous_categories(id, nom), collections!inner(id, nom)`
            , {count: 'exact', head: false})
            .eq('etat_publication', 2);

        if(categorie) query.eq('id_categorie', parseInt(categorie));
        if(sous_categorie) query.eq('id_sous_categorie', parseInt(sous_categorie));
        if(collection) query.eq('collections.id', parseInt(collection));
        if(magasin) query.eq('magasins.id', parseInt(magasin));


        query.range((start - 1) * nbElement, start * nbElement - 1);
        
        const { data, error, count } = await query;
        if(error) {
            throw error;
        }

        const response = {count, data}

        return new Response(JSON.stringify(response), { headers: { ...corsHeaders }, status: 200 })
    } catch(e: any) {
        console.log('Error ! ', e);
        return new Response(JSON.stringify(e), { headers: { ...corsHeaders }, status: 200 })
    }
})