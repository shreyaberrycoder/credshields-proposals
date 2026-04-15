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

    const leadsRes = await db.from('leads').delete().eq('proposal_id', id)
    if (leadsRes.error) console.error('leads delete error:', leadsRes.error)

    const viewsRes = await db.from('views').delete().eq('proposal_id', id)
    if (viewsRes.error) console.error('views delete error:', viewsRes.error)

    const { data, error, count } = await db
      .from('proposals')
      .delete({ count: 'exact' })
      .eq('id', id)
      .select()

    if (error) {
      console.error('proposals delete error:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No rows deleted — likely blocked by RLS policy or row not found', deletedCount: 0 },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, deletedCount: count ?? data.length })
  } catch (err) {
    console.error('DELETE /api/proposals error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
