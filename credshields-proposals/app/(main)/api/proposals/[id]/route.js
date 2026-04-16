import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PATCH(req, { params }) {
  try {
    const db   = admin()
    const { id } = await params
    const body = await req.json()
    const updates = {}
    if (body.clientName            !== undefined) updates.client_name            = body.clientName
    if (body.company               !== undefined) updates.company                = body.company
    if (body.proposalType          !== undefined) updates.proposal_type          = body.proposalType
    if (body.originalPrice         !== undefined) updates.original_price         = body.originalPrice
    if (body.finalPrice            !== undefined) updates.final_price            = body.finalPrice
    if (body.loc                   !== undefined) updates.loc                    = body.loc
    if (body.days                  !== undefined) updates.days                   = body.days
    if (body.scopeDescription      !== undefined) updates.scope_description      = body.scopeDescription
    if (body.customTimeline        !== undefined) updates.custom_timeline        = body.customTimeline
    if (body.customVulnerabilities !== undefined) updates.custom_vulnerabilities = body.customVulnerabilities
    updates.updated_at = new Date().toISOString()

    const { data, error } = await db.from('proposals').update(updates).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('PATCH /api/proposals error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const db = admin()
    const { id } = await params

    await db.from('leads').delete().eq('proposal_id', id)
    await db.from('views').delete().eq('proposal_id', id)
    const { error } = await db.from('proposals').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/proposals error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
