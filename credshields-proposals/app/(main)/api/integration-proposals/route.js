import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function GET() {
  const { data, error } = await db().from('integration_proposals').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { company, proposal_date, company_logo, chain_name, explorer_name, integration_fee, explorer_screenshot } = body
  if (!company || !proposal_date) {
    return NextResponse.json({ error: 'Company and date are required' }, { status: 400 })
  }
  const { data, error } = await db().from('integration_proposals').insert({
    company, proposal_date, company_logo,
    chain_name: chain_name || 'Unichain',
    explorer_name: explorer_name || 'Unichain Explorer',
    integration_fee: integration_fee || '$2500',
    explorer_screenshot,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
