import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Scoped to the caller's own JWT — only used to identify who is calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: callerData, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !callerData.user) return json({ error: 'Not authenticated' }, 401)

    const { data: callerProfile, error: profileError } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .single()

    if (profileError || callerProfile?.role !== 'superadmin') {
      return json({ error: 'Forbidden' }, 403)
    }

    const { userId } = await req.json()
    if (!userId || typeof userId !== 'string') return json({ error: 'userId is required' }, 400)
    if (userId === callerData.user.id) {
      return json({ error: 'You cannot delete your own account' }, 400)
    }

    // Only this admin client (service role, never sent to the browser) can delete auth users.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) return json({ error: deleteError.message }, 500)

    return json({ success: true }, 200)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500)
  }
})