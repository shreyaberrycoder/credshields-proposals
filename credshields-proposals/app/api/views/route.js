import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const db = admin()
  const { proposalId } = await req.json()
  if (!proposalId) return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 })
  await db.from('views').insert({ proposal_id: proposalId })
  return NextResponse.json({ success: true })
}
