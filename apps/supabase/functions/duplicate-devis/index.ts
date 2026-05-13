// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
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

  if(!body.devis_id) {
      return { success: false, error: { message: 'Missing devis_id' }};
  }

  const devis = await userClient.from('devis')
    .select('*')
    .eq('statut', 'EN_ATTENTE')
    .eq('id', body.devis_id)
    .single();

  if(devis.error) {
      return { success: false, error: devis.error };
  }

  if(devis.data) {
    const devisData = devis.data;

    const devisDupliquer = await userClient.from('devis').insert({
      ...devisData,
      intitule: `Copie de ${devisData.intitule}`,      
      statut: 'EN_ATTENTE',      
      date_creation: new Date().toISOString(),
      version: 1
    }).select('*').single();

    if(devisDupliquer.error) {
      return { success: false, error: devisDupliquer.error };
    }

    const devisLignes = await userClient.from('devis_lignes')
      .select('*')
      .eq('id_devis', devisData.id);

    if(devisLignes.error) {
      return { success: false, error: devisLignes.error };
    }

    const devisLignesData = devisLignes.data;
    for(const ligne of devisLignesData) {
      const devisLigneDupliquer = await userClient.from('devis_lignes').insert({
        ...ligne,
        id_devis: devisDupliquer.data.id,
        date_creation: new Date().toISOString()
      }).select('*').single();

      if(devisLigneDupliquer.error) {
        return { success: false, error: devisLigneDupliquer.error };
      }
    }

    const devisReductions = await userClient.from('devis_reductions')
      .select('*')
      .eq('id_devis', devisData.id);

    if(devisReductions.error) {
      return { success: false, error: devisReductions.error };
    }

    const devisReductionsData = devisReductions.data;
    for(const reduction of devisReductionsData) {
      const devisReductionDupliquer = await userClient.from('devis_reductions').insert({
        ...reduction,
        id_devis: devisDupliquer.data.id
      }).select('*').single();

      if(devisReductionDupliquer.error) {
        return { success: false, error: devisReductionDupliquer.error };
      }
    }
  }

  return { success: true };
}, {
  allowOnlyAdmin: true
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/duplicate-devis' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
