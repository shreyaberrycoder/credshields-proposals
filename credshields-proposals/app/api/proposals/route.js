import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: proposals, error } = await db
      .from('proposals')
      .select('*, leads(id, email, viewed_at)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const ids = proposals.map(p => p.id)
    let viewCounts = {}
    if (ids.length > 0) {
      const { data: views } = await db
        .from('views')
        .select('proposal_id')
        .in('proposal_id', ids)
      views?.forEach(v => {
        viewCounts[v.proposal_id] = (viewCounts[v.proposal_id] || 0) + 1
      })
    }

    return NextResponse.json(proposals.map(p => ({ ...p, views: viewCounts[p.id] || 0 })))
  } catch (err) {
    console.error('GET /api/proposals error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await req.json()
    const { clientName, company, originalPrice, finalPrice, loc, days, scopeDescription, slug } = body

    if (!slug || !clientName || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await db
      .from('proposals')
      .insert({
        slug,
        client_name:       clientName,
        company,
        original_price:    originalPrice,
        final_price:       finalPrice,
        loc,
        days,
        scope_description: scopeDescription,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/proposals error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
