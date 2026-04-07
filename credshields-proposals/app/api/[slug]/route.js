export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProposalPDF } from '../../../../lib/ProposalPDF'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(req, { params }) {
  try {
    const { slug } = params

    // Fetch proposal + leads
    const { data: proposal, error } = await db()
      .from('proposals')
      .select('*, leads(id, email, viewed_at)')
      .eq('slug', slug)
      .single()

    if (error || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Parse extra_fields
    const extraFields = proposal.extra_fields
      ? (typeof proposal.extra_fields === 'string'
          ? JSON.parse(proposal.extra_fields)
          : proposal.extra_fields)
      : {}

    // Parse custom data
    let customTimeline = null
    let customVulnerabilities = null
    if (proposal.custom_timeline) {
      try { customTimeline = JSON.parse(proposal.custom_timeline) } catch (e) {}
    }
    if (proposal.custom_vulnerabilities) {
      try { customVulnerabilities = JSON.parse(proposal.custom_vulnerabilities) } catch (e) {}
    }

    const enriched = { ...proposal, extraFields, customTimeline, customVulnerabilities }

    // Generate PDF buffer
    const buffer = await renderToBuffer(ProposalPDF({ proposal: enriched }))

    const filename = `${proposal.company.replace(/[^a-z0-9]/gi, '-')}-proposal.pdf`

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
