import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AnalysisRequest {
  query: string;
  templateId: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, templateId, userId }: AnalysisRequest = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch template and entries
    const { data: template } = await supabaseClient
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    const { data: entries } = await supabaseClient
      .from('entries')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (!template || !entries) {
      throw new Error('Template or entries not found');
    }

    // Format data for analysis
    const formattedData = entries.map(entry => ({
      date: entry.date,
      values: Object.entries(entry.values).map(([fieldId, value]) => {
        const field = template.fields.find(f => f.id === fieldId);
        return {
          field: field?.name,
          value: field?.type === 'rating' 
            ? ['Poor', 'Below average', 'Average', 'Above average', 'Excellent'][Number(value) - 1]
            : value
        };
      })
    }));

    // Create analysis prompt
    const prompt = `
      Analyze the following tracking data and answer this question: "${query}"
      
      Template: ${template.name}
      Number of entries: ${entries.length}
      Date range: ${entries[entries.length - 1]?.date} to ${entries[0]?.date}
      
      Data:
      ${JSON.stringify(formattedData, null, 2)}
      
      Please provide a clear, concise analysis focusing specifically on the user's question.
      Include relevant patterns, trends, or insights you observe in the data.
    `;

    // Save analysis to database
    await supabaseClient
      .from('analyses')
      .insert({
        template_id: templateId,
        user_id: userId,
        query,
        response: prompt,
      });

    return new Response(
      JSON.stringify({ response: prompt }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});