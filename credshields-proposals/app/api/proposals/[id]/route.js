import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// PATCH — edit an existing proposal
export async function PATCH(req, { params }) {
  const db = admin()
  const body = await req.json()
  const updates = {}
  if (body.clientName !== undefined)       updates.client_name       = body.clientName
  if (body.company !== undefined)          updates.company           = body.company
  if (body.originalPrice !== undefined)    updates.original_price    = body.originalPrice
  if (body.finalPrice !== undefined)       updates.final_price       = body.finalPrice
  if (body.loc !== undefined)              updates.loc               = body.loc
  if (body.days !== undefined)             updates.days              = body.days
  if (body.scopeDescription !== undefined) updates.scope_description = body.scopeDescription

  const { data, error } = await db
    .from('proposals')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remove proposal and all its leads/views
export async function DELETE(req, { params }) {
  const db = admin()
  await db.from('leads').delete().eq('proposal_id', params.id)
  await db.from('views').delete().eq('proposal_id', params.id)
  const { error } = await db.from('proposals').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
