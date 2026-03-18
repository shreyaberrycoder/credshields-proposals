import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ProposalClient from './ProposalClient'

export async function generateMetadata({ params }) {
  return {
    title: `Security Audit Proposal — CredShields`,
    description: 'Smart Contract Security Audit Proposal',
  }
}

export default async function ProposalPage({ params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !proposal) notFound()

  return <ProposalClient proposal={proposal} />
}
