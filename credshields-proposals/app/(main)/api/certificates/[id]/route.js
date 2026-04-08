import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function certId(num) {
  return `CS-AUDIT-${new Date().getFullYear()}-WS-${String(num).padStart(3, '0')}`
}

export async function GET(req, { params }) {
  const { id } = await params
  const { data, error } = await db().from('certificates').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ ...data, cert_id: certId(data.cert_number) })
}

export async function PUT(req, { params }) {
  const { id } = await params
  const body = await req.json()
  const { data, error } = await db().from('certificates').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, cert_id: certId(data.cert_number) })
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const { error } = await db().from('certificates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
