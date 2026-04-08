import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const db = admin()
  const { proposalId, email } = await req.json()

  if (!email || !proposalId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check for duplicate (same email + proposal)
  const { data: existing } = await db
    .from('leads')
    .select('id')
    .eq('proposal_id', proposalId)
    .eq('email', email)
    .maybeSingle()

  // If they've already submitted, just let them in (don't double-count)
  if (existing) return NextResponse.json({ success: true, duplicate: true })

  const { data, error } = await db
    .from('leads')
    .insert({ proposal_id: proposalId, email })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
