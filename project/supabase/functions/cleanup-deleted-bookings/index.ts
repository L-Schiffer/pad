import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lösche alle Einträge, die vor mehr als 45 Tagen gelöscht wurden
    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .lt('deleted_at', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString())
      .not('deleted_at', 'is', null);

    if (error) {
      console.error('Error deleting old bookings:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deletedCount = data?.length || 0;
    console.log(`Successfully deleted ${deletedCount} old bookings`);

    return new Response(
      JSON.stringify({
        success: true,
        deleted_count: deletedCount,
        message: `Deleted ${deletedCount} bookings older than 45 days`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
