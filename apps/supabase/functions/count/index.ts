// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/index.ts"

import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: { ...corsHeaders }, status: 200 })
    } 

    const { table, limit, filter, filter_value } = await req.json();

    let dataCount = 0;
    if(filter && filter_value) {
      const { count } = await supabase.from(table).select('*', {count: 'exact', head: true}).eq(filter, filter_value);
      if(count)
        dataCount = count;
    } else {
      const { count } = await supabase.from(table).select('*', {count: 'exact', head: true});
      if(count)
        dataCount = count;
    }

    console.log(`Retrived elements for ${table} : ${dataCount}, pages : ${limit ? Math.ceil(dataCount/limit) : Math.ceil(dataCount/100)}`)

    const data = {
      value: Array(limit ? Math.ceil(dataCount/limit) : Math.ceil(dataCount/100)).fill(null).map((_, i) => i + 1)
    }


    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch(e) {
    console.log('Error ! ', e);
    return new Response(
      JSON.stringify({value: []}),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
