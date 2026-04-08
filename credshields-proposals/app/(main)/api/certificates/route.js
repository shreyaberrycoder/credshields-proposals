import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function certId(num) {
  return `CS-AUDIT-${new Date().getFullYear()}-WS-${String(num).padStart(3, '0')}`
}

export async function GET() {
  const { data, error } = await db().from('certificates').select('*').order('cert_number', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(c => ({ ...c, cert_id: certId(c.cert_number) })))
}

export async function POST(req) {
  const body = await req.json()
  const { project_name, project_logo, audit_period, retest_date, lead_auditor, report_version,
    audited_contract, network, contract_audited, contract_retested, owasp_framework,
    methodology, critical, high, medium, low, info, gas, issue_date } = body

  if (!project_name || !audit_period || !issue_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await db().from('certificates').insert({
    project_name, project_logo, audit_period, retest_date,
    lead_auditor: lead_auditor || 'Shashank (Co-founder)',
    report_version: report_version || 'Final',
    audited_contract, network, contract_audited, contract_retested,
    owasp_framework: owasp_framework || 'SCSVS / SCWE / SCSTG',
    methodology: methodology || 'Manual Review',
    critical: critical || 0, high: high || 0, medium: medium || 0,
    low: low || 0, info: info || 0, gas: gas || 0, issue_date,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, cert_id: certId(data.cert_number) })
}
