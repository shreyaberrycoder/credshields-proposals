import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET all proposals with lead counts and view counts
export async function GET() {
  const db = admin()

  const { data: proposals, error } = await db
    .from('proposals')
    .select('*, leads(id, email, viewed_at)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get view counts
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

  const enriched = proposals.map(p => ({ ...p, views: viewCounts[p.id] || 0 }))
  return NextResponse.json(enriched)
}

// POST create proposal
export async function POST(req) {
  const db = admin()
  const { clientName, company, originalPrice, finalPrice, loc, days, scopeDescription, slug } = await req.json()

  const { data, error } = await db
    .from('proposals')
    .insert({
      slug,
      client_name: clientName,
      company,
      original_price: originalPrice,
      final_price: finalPrice,
      loc,
      days,
      scope_description: scopeDescription,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
