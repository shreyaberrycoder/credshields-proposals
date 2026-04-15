'use client'
import { useState, useEffect } from 'react'
import { PROPOSAL_TYPES } from '../../../../lib/proposalTypes'

function CredShieldsLogo({ height = 40 }) {
  return <img src="/cs-logo.png" alt="CredShields" style={{ height, width: 'auto', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
}

// ── Fuzz / Multichain collapsible tables (smart contract only) ───────────────
const FUZZ_VULNS = [
  { vuln: 'Stateful Invariant Testing',           checks: ['Handler-based call sequences with configurable depth and run count', 'Protocol-wide invariants asserted after every state-changing call', 'Cross-contract invariant preservation'] },
  { vuln: 'Property-Based Unit Fuzzing',          checks: ['Randomised input generation for every public/external function', 'Boundary value seeding (max, min, edge values)', 'Output postcondition assertions on return values and state deltas'] },
  { vuln: 'Arithmetic & Precision Invariants',    checks: ['Exchange rate monotonicity under deposits/withdrawals', 'Correct rounding direction', 'Fee accrual vs withdrawal solvency checks'] },
  { vuln: 'Access Control & Privilege Escalation',checks: ['Fuzzed caller addresses targeting restricted functions', 'Role-based invariant enforcement', 'Ownership transfer under adversarial sequences'] },
  { vuln: 'Reentrancy & Callback Safety',         checks: ['Malicious callback contracts as fuzz actors', 'State consistency checks mid-execution', 'Cross-function reentrancy testing'] },
  { vuln: 'Economic & Tokenomics Invariants',     checks: ['Supply conservation checks', 'Reward fairness across randomised sequences', 'No-free-value extraction guarantees'] },
  { vuln: 'Liquidity & Solvency Assertions',      checks: ['Reserves ≥ user claims at all times', 'Withdrawal liveness guarantees', 'Drain-resistance under sequential withdrawals'] },
  { vuln: 'Temporal & Ordering Sensitivity',      checks: ['Timestamp manipulation testing', 'Transaction ordering (MEV scenarios)', 'Epoch/reward boundary edge cases'] },
  { vuln: 'Upgrade & Proxy Storage Safety',       checks: ['Storage layout collision checks', 'Initialisation safety', 'Post-upgrade invariant validation'] },
  { vuln: 'Factory & Clone Correctness',          checks: ['Fuzzed deployment parameters', 'Clone-level invariant validation', 'Cross-clone isolation guarantees'] },
  { vuln: 'DoS & Gas Griefing Resilience',        checks: ['Unbounded loop testing', 'Gas profiling under adversarial inputs', 'Block gas feasibility checks'] },
  { vuln: 'Campaign Reporting & Reproducibility', checks: ['Full fuzz logs with seeds and execution depth', 'Minimal reproducer extraction', 'Gas report aggregation'] },
]

const MULTICHAIN_VULNS = [
  { vuln: 'Cross-Chain Message Integrity',            checks: ['Message authenticity and ordering validation', 'Replay protection via nonce handling', 'Payload encoding/decoding consistency (LayerZero, CCIP, etc.)'] },
  { vuln: 'Chain-Specific Compiler & EVM Divergence', checks: ['Solidity version compatibility', 'Opcode availability differences', 'Gas cost variations across chains'] },
  { vuln: 'Deterministic Deployment Verification',    checks: ['CREATE2 address consistency', 'Init code and constructor validation', 'Deployer nonce alignment'] },
  { vuln: 'Bridge & Relayer Trust Assumptions',       checks: ['Relayer decentralisation checks', 'Bridge failure fallback handling', 'Token lock/mint parity validation'] },
  { vuln: 'Multi-Chain State Synchronisation',        checks: ['Governance/state consistency across chains', 'Timestamp/block differences handling', 'Sync lag tolerance mechanisms'] },
  { vuln: 'Gas & Fee Model Divergence',               checks: ['L2 calldata/blob gas differences', 'Dynamic gas pricing behaviour', 'Fee/refund mechanism validation'] },
  { vuln: 'Access Control & Admin Portability',       checks: ['Multi-sig/timelock parity', 'Role consistency across chains', 'Emergency pause propagation'] },
  { vuln: 'Token Standard & Decimal Mismatch',        checks: ['Decimal normalization across chains', 'Wrapped vs native token behaviour', 'Permit/EIP-2612 compatibility'] },
  { vuln: 'Upgrade & Proxy Portability',              checks: ['Proxy storage consistency', 'Implementation alignment', 'Upgrade sequencing across chains'] },
  { vuln: 'Finality & Reorg Resilience',              checks: ['Confirmation depth validation', 'Reorg handling (L1/L2)', 'Rollback recovery mechanisms'] },
  { vuln: 'Chain-Specific Precompiles & Features',    checks: ['Precompile availability differences', 'Account abstraction/paymaster variations', 'Chain-specific system contracts'] },
  { vuln: 'End-to-End Integration & Chaos Testing',   checks: ['Full cross-chain lifecycle testing', 'Bridge downtime/failure simulations', 'Multi-chain invariant fuzzing'] },
]

function CollapsibleVulnTable({ title, icon, badge, rows, forceOpen }) {
  const [open, setOpen] = useState(false)
  const isOpen = forceOpen || open
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => !forceOpen && setOpen(o => !o)}
        style={{ width: '100%', background: isOpen ? 'rgba(79,255,164,0.04)' : '#0d1120', border: 'none', cursor: forceOpen ? 'default' : 'pointer', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: isOpen ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e8edf5' }}>{title}</span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace', background: 'rgba(79,255,164,0.08)', color: '#4fffa4', border: '1px solid rgba(79,255,164,0.15)' }}>{badge}</span>
        </div>
        {!forceOpen && <span style={{ color: '#7a8a9e', fontSize: 18, lineHeight: 1 }}>{isOpen ? '▲' : '▼'}</span>}
      </button>
      {isOpen && (
        <div style={{ background: '#080b12', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead><tr><th style={vt.th}>VULNERABILITY</th><th style={vt.th}>CHECKPOINTS</th></tr></thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ ...vt.td, fontWeight: 700, width: '32%', verticalAlign: 'top' }}>{row.vuln}</td>
                  <td style={{ ...vt.td, verticalAlign: 'top' }}>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {row.checks.map((c, j) => <li key={j} style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.7, marginBottom: 2 }}>{c}</li>)}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#7a8a9e', margin: 0 }}>💬 Let us know if you need to scope out these services.</p>
            <a href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: '#4fffa4', fontFamily: 'monospace', textDecoration: 'none', border: '1px solid rgba(79,255,164,0.3)', padding: '6px 14px', borderRadius: 6, whiteSpace: 'nowrap' }}>Discuss Scope →</a>
          </div>
        </div>
      )}
    </div>
  )
}

const vt = {
  th: { padding: '12px 20px', textAlign: 'left', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a8a9e', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.02)' },
  td: { padding: '16px 20px', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.04)' },
}

function Section({ label, title, sub, children }) {
  return (
    <section style={{ padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={p.wrap}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4fffa4', marginBottom: 12, fontFamily: 'monospace' }}>{label}</div>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(26px,4vw,38px)', letterSpacing: '-0.01em', marginBottom: 16, lineHeight: 1.15 }}>{title}</h2>
        {sub && <p style={{ fontSize: 16, color: '#7a8a9e', maxWidth: 580, marginBottom: 40, fontWeight: 300, lineHeight: 1.8 }}>{sub}</p>}
        {children}
      </div>
    </section>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProposalClient({ proposal }) {
  const [unlocked, setUnlocked]     = useState(false)
  const [email, setEmail]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [isPdf, setIsPdf]           = useState(false)
  const storageKey = `cs_unlocked_${proposal.id}`

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pdf') === '1') { setIsPdf(true); setUnlocked(true); setTimeout(() => window.print(), 1500) }
  }, [])

  useEffect(() => {
    if (!isPdf) fetch('/api/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalId: proposal.id }) })
    try { if (localStorage.getItem(storageKey) === 'true') setUnlocked(true) } catch (e) {}
  }, [proposal.id, storageKey, isPdf])

  const submitEmail = async () => {
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.')
    setSubmitting(true); setError('')
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalId: proposal.id, email }) })
    if (res.ok) { try { localStorage.setItem(storageKey, 'true') } catch (e) {}; setUnlocked(true) }
    else setError('Something went wrong. Please try again.')
    setSubmitting(false)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {!unlocked && !isPdf && (
        <div style={g.overlay}>
          <div style={g.box}>
            <CredShieldsLogo height={40} />
            <div style={g.icon}>🔒</div>
            <h2 style={g.title}>Your Proposal is Ready</h2>
            <p style={g.sub}>Enter your work email to access the security proposal prepared for <strong style={{ color: '#e8edf5' }}>{proposal.company}</strong>.</p>
            <input style={g.input} type="email" placeholder="you@company.com" value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && submitEmail()} autoFocus />
            {error && <p style={g.error}>{error}</p>}
            <button style={g.btn} onClick={submitEmail} disabled={submitting}>{submitting ? 'Unlocking…' : 'View Proposal →'}</button>
            <p style={g.privacy}>🔐 Your email is only shared with the CredShields team.</p>
          </div>
        </div>
      )}
      <div style={{ filter: unlocked ? 'none' : 'blur(6px)', pointerEvents: unlocked ? 'auto' : 'none', userSelect: unlocked ? 'auto' : 'none' }}>
        <ProposalContent proposal={proposal} isPdf={isPdf} />
      </div>
    </div>
  )
}

// ── Proposal Content ──────────────────────────────────────────────────────────
function ProposalContent({ proposal, isPdf }) {
  const fmt    = n => Number(n).toLocaleString()
  const type   = proposal.proposal_type || 'smart_contract'
  const config = PROPOSAL_TYPES[type] || PROPOSAL_TYPES.smart_contract
  const disc   = proposal.original_price > proposal.final_price
    ? Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100) : 0
  const month  = new Date(proposal.created_at).toLocaleString('default', { month: 'long' })
  const year   = new Date(proposal.created_at).getFullYear()
  const price  = proposal.final_price

  // Parse stored data
  let timeline = config.methodology || []
  if (proposal.custom_timeline) { try { timeline = JSON.parse(proposal.custom_timeline) } catch (e) {} }

  const extraFields = proposal.extra_fields
    ? (typeof proposal.extra_fields === 'string' ? JSON.parse(proposal.extra_fields) : proposal.extra_fields)
    : {}

  const vulnRows = config.vulnerabilities || null
  let customVulnRows = []
  if (!vulnRows && proposal.custom_vulnerabilities) { try { customVulnRows = JSON.parse(proposal.custom_vulnerabilities) } catch (e) {} }
  const showVulnSection = vulnRows || customVulnRows.length > 0

  const compRows = config.competitors(price).filter(c => !c.highlight)

  const isRedTeam = type === 'red_team'
  const activeVectors = (extraFields.redTeamVectors || [])
    .map(id => config.redTeamVectors?.find(v => v.id === id))
    .filter(Boolean)

  // Cover title per type
  const coverTitles = {
    smart_contract: <>{`Security`}<br />{`Audit`}<br /><span style={{ color: '#4fffa4' }}>Proposal</span></>,
    fuzzing:        <>{`Fuzz Testing`}<br /><span style={{ color: '#4fffa4' }}>Proposal</span></>,
    multichain:     <>{`Multi-Chain`}<br />{`Security`}<br /><span style={{ color: '#4fffa4' }}>Audit</span></>,
    web_app:        <>{`Web App`}<br />{`Security`}<br /><span style={{ color: '#4fffa4' }}>Audit</span></>,
    mobile:         <>{`Mobile App`}<br />{`Security`}<br /><span style={{ color: '#4fffa4' }}>Audit</span></>,
    traditional:    <>{`Security`}<br />{`Assessment`}<br /><span style={{ color: '#4fffa4' }}>Proposal</span></>,
    red_team:       <>{`Think like`}<br />{`the`}<br /><span style={{ color: '#4fffa4' }}>enemy.</span></>,
  }

  return (
    <div style={p.page}>

      {/* COVER */}
      <div style={p.cover}>
        <div style={p.coverBg} />
        <div style={p.coverGrid} />
        <div style={p.wrap}>
          <div style={p.logoLine}><CredShieldsLogo height={52} /></div>
          <div style={p.eyebrow}>— {config.label}</div>
          <h1 style={p.coverTitle}>{coverTitles[type] || coverTitles.smart_contract}</h1>
          <p style={p.coverSub}>
            {isRedTeam
              ? <>A full-spectrum adversarial engagement designed for <strong style={{ color: '#e8edf5' }}>{proposal.company}</strong> — before a real attacker finds what your defences missed.</>
              : <>Prepared exclusively for <strong style={{ color: '#e8edf5' }}>{proposal.client_name}</strong> at <strong style={{ color: '#e8edf5' }}>{proposal.company}</strong>.</>
            }
          </p>
          <div style={p.coverMeta}>
            {[
              { label: 'Prepared by', value: 'CredShields Technologies Pte. Ltd.' },
              { label: 'Scope', value: proposal.company },
              { label: 'Engagement Price', value: `$${fmt(proposal.final_price)} USD`, green: true },
              ...(isRedTeam && extraFields.threatActorProfile ? [{ label: 'Threat Profile', value: extraFields.threatActorProfile }] : []),
            ].map(m => (
              <div key={m.label}>
                <div style={p.metaLabel}>{m.label}</div>
                <div style={{ ...p.metaValue, ...(m.green ? { color: '#4fffa4', fontFamily: 'monospace' } : {}) }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={p.coverBadge}>
            <span style={p.redDot} />
            {isRedTeam ? `Confidential engagement — NDA applies` : `Only 2 audit slots remaining in ${month} — availability is limited`}
          </div>
        </div>
      </div>

      {/* RED TEAM: Threat Landscape */}
      {isRedTeam && (
        <Section label="01 Why Red Teaming" title={<>The threat is real.<br /><span style={{ color: '#4fffa4' }}>The question is readiness.</span></>}
          sub="Traditional security audits find known vulnerabilities. Red teaming finds what attackers actually exploit — the gaps between your controls, your people, your protocols, and your assumptions.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { icon: '⛓️', title: 'On-Chain Protocol Risk',      stat: '$3.6B lost in 2025',  desc: 'Smart contract vulnerabilities, flash loan attacks, oracle manipulation, and governance exploits continue to drain billions. Logic errors that survive standard audits are found by adversaries.' },
              { icon: '🎯', title: 'Advanced Persistent Threats',  stat: '194 days avg dwell',  desc: 'Nation-state and sophisticated criminal actors conduct multi-month reconnaissance campaigns. Standard defences are tested, mapped, and systematically avoided before any attack begins.' },
              { icon: '🤖', title: 'AI-Augmented Attacks',         stat: 'New threat class',    desc: 'LLM-powered phishing, deepfake voice cloning, automated vulnerability discovery, and adversarial prompt injection represent a threat class most teams are unprepared for.' },
              { icon: '👤', title: 'Human Element',                stat: '82% of breaches',     desc: '82% of breaches involve the human element. From targeted spear-phishing to SIM-swapping key personnel, the weakest link is almost never a firewall.' },
              { icon: '☁️', title: 'Cloud & Infrastructure',        stat: '$4.8M avg cost',     desc: 'Misconfigured S3 buckets, over-privileged IAM roles, exposed CI/CD pipelines, and shadow IT create invisible attack paths that automated scanners routinely miss.' },
              { icon: '🔗', title: 'Supply Chain Exposure',         stat: 'Growing attack vec',  desc: 'Dependency confusion, compromised packages, and vendor access are routinely leveraged for cascading compromise. Your security is only as strong as your weakest dependency.' },
            ].map(t => (
              <div key={t.title} style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#4fffa4', marginBottom: 10, letterSpacing: '0.06em' }}>↗ {t.stat}</div>
                <p style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.65 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* PRICING */}
      <Section label={isRedTeam ? '02 Engagement Scope' : 'Scope & Pricing'}
        title={isRedTeam ? <>Engagement <span style={{ color: '#4fffa4' }}>Overview</span></> : <>Your Audit, <span style={{ color: '#4fffa4' }}>Scoped & Priced</span></>}
        sub={isRedTeam ? 'Full-spectrum adversarial simulation — scoped around your specific threat model and crown jewels.' : "Everything included. No surprises. 50% to start, 50% after retest. Paid only when you're satisfied with the fixes."}>
        <div style={p.urgencyBar}>
          <span style={{ fontSize: 18 }}>{isRedTeam ? '🎯' : '⚠️'}</span>
          <p style={{ fontSize: 14, color: isRedTeam ? '#b3d4ff' : '#ffb3be', margin: 0 }}>
            <strong style={{ color: isRedTeam ? '#4fa3ff' : '#ff4f6a' }}>
              {isRedTeam ? 'Adversaries are already conducting reconnaissance against your organisation.' : '$3.6B+ was lost to exploits in 2025.'}
            </strong>
            {isRedTeam ? ' The question is not whether you\'ll be targeted — it\'s whether you\'ll know when it happens.' : ' An audit at this stage is the highest-ROI security investment your protocol will ever make.'}
          </p>
        </div>
        <div style={p.priceCard}>
          <div style={p.priceCardHead}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{proposal.company} — {config.label}</span>
            {disc > 0 && <span style={p.discBadgeLg}>{disc}% DISCOUNT APPLIED</span>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Client', proposal.client_name],
                ...(proposal.loc && !isRedTeam ? [['Lines of Code / Scope', fmt(proposal.loc)]] : []),
                ...(extraFields.chainsInScope ? [['Chains in Scope', extraFields.chainsInScope]] : []),
                ...(extraFields.mobilePlatform ? [['Platform', extraFields.mobilePlatform]] : []),
                ...(extraFields.appName ? [['Application', extraFields.appName]] : []),
                ...(extraFields.appUrls ? [['URL(s)', extraFields.appUrls]] : []),
                ...(extraFields.environments ? [['Environments', extraFields.environments]] : []),
                ...(extraFields.assetsInScope ? [['Assets in Scope', extraFields.assetsInScope]] : []),
                ...(extraFields.complianceFramework && extraFields.complianceFramework !== 'None / Not applicable' ? [['Compliance Target', extraFields.complianceFramework]] : []),
                ...(extraFields.crownJewels ? [['Crown Jewels / Objectives', extraFields.crownJewels]] : []),
                ...(extraFields.threatActorProfile ? [['Threat Actor Profile', extraFields.threatActorProfile]] : []),
                ['Engagement Duration', `${proposal.days} ${isRedTeam ? (proposal.days == 1 ? 'phase' : 'phases') : (proposal.days == 1 ? 'Business Day' : 'Business Days')}`],
                ...(disc > 0 ? [['Standard Price', null, `$${fmt(proposal.original_price)} USD`]] : []),
              ].map(([label, val, strike]) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={p.priceTd}><span style={{ color: '#7a8a9e', fontSize: 13 }}>{label}</span></td>
                  <td style={{ ...p.priceTd, textAlign: 'right' }}>
                    {strike ? <span style={{ textDecoration: 'line-through', color: '#7a8a9e', fontSize: 13 }}>{strike}</span> : <span style={{ fontSize: 13 }}>{val}</span>}
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(79,255,164,0.04)' }}>
                <td style={{ ...p.priceTd, fontSize: 18, fontWeight: 700 }}>Engagement Price</td>
                <td style={{ ...p.priceTd, textAlign: 'right', fontSize: 22, fontWeight: 700, color: '#4fffa4', fontFamily: 'monospace' }}>${fmt(proposal.final_price)} USD</td>
              </tr>
            </tbody>
          </table>
          <div style={p.priceFooter}>
            {(isRedTeam
              ? ['50% upfront, 50% on delivery', 'Comprehensive NDA in place', 'All findings under strict confidentiality', 'Remediation support included']
              : ['50% upfront, 50% before retest', 'USDC via Ethereum, Base, or Polygon', 'Fiat accepted', 'Free 3-month retest window']
            ).map(t => <span key={t} style={p.priceFooterItem}><span style={{ color: '#4fffa4' }}>✓</span> {t}</span>)}
          </div>
        </div>
        {proposal.scope_description && (
          <div style={{ marginTop: 24, background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7a8a9e', fontFamily: 'monospace', marginBottom: 10 }}>Engagement Scope</div>
            <p style={{ fontSize: 14, color: '#e8edf5', lineHeight: 1.7, margin: 0 }}>{proposal.scope_description}</p>
          </div>
        )}
      </Section>

      {/* RED TEAM: Attack Vectors in scope */}
      {isRedTeam && activeVectors.length > 0 && (
        <Section label="03 Attack Vectors" title={<>Eight vectors.<br /><span style={{ color: '#4fffa4' }}>One integrated program.</span></>}
          sub="We assess every layer of your security posture — technical, human, physical, and systemic. The following vectors are in scope for this engagement.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activeVectors.map((v, i) => (
              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '28px 0' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4fffa4', paddingTop: 3, textAlign: 'right', paddingRight: 24 }}>{v.num}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{v.title}</div>
                  <p style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.7, marginBottom: 12 }}>{v.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {v.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace', background: 'rgba(79,255,164,0.06)', color: '#4fffa4', border: '1px solid rgba(79,255,164,0.12)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Rules of engagement */}
          {extraFields.rulesOfEngagement && (
            <div style={{ marginTop: 24, background: 'rgba(255,79,106,0.04)', border: '1px solid rgba(255,79,106,0.15)', borderRadius: 10, padding: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ff4f6a', fontFamily: 'monospace', marginBottom: 10 }}>Rules of Engagement</div>
              <p style={{ fontSize: 14, color: '#e8edf5', lineHeight: 1.7, margin: 0 }}>{extraFields.rulesOfEngagement}</p>
            </div>
          )}
          {/* Scope inclusions */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Physical Access', val: extraFields.physicalInScope },
              { label: 'Social Engineering', val: extraFields.socialEngineeringInScope },
              { label: 'Detection Testing', val: extraFields.detectionTesting },
            ].map(item => (
              <span key={item.label} style={{ fontFamily: 'monospace', fontSize: 11, padding: '4px 14px', borderRadius: 20, background: item.val === 'yes' ? 'rgba(79,255,164,0.06)' : 'rgba(255,255,255,0.03)', color: item.val === 'yes' ? '#4fffa4' : '#7a8a9e', border: `1px solid ${item.val === 'yes' ? 'rgba(79,255,164,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                {item.val === 'yes' ? '✓' : '✗'} {item.label}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* TIMELINE */}
      <Section label={isRedTeam ? '04 Methodology' : 'Audit Timeline'}
        title={isRedTeam ? <>Intelligence-led.<br /><span style={{ color: '#4fffa4' }}>Objective-based.</span></> : <>Done in <span style={{ color: '#4fffa4' }}>{proposal.days} {proposal.days == 1 ? 'Day' : 'Days'}</span></>}
        sub={isRedTeam ? "We follow a structured adversarial methodology modelled on real-world attacker playbooks — scoped around your specific objectives, not generic vulnerability lists." : "Fast without cutting corners. Here is exactly what happens and when."}>
        <div>
          {timeline.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 24px', position: 'relative' }}>
              <div style={{ fontSize: 11, color: '#4fffa4', fontFamily: 'monospace', paddingTop: 4, textAlign: 'right', paddingRight: 24, position: 'relative' }}>
                {item.day || item.duration || item.step}
                {i < timeline.length - 1 && <div style={{ position: 'absolute', right: -1, top: 20, bottom: -28, width: 1, background: 'rgba(255,255,255,0.07)' }} />}
              </div>
              <div style={{ paddingBottom: 32 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* DELIVERABLES */}
      <Section label="Deliverables" title={<>What You <span style={{ color: '#4fffa4' }}>Walk Away With</span></>}
        sub={isRedTeam ? "Every red team engagement produces actionable intelligence — not just a list of CVEs. Our deliverables drive decisions at every level of your organisation." : "Three compounding credibility assets not just a PDF."}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {(isRedTeam ? [
            { icon: '📋', title: 'Executive Summary Report',     desc: 'Board-ready narrative of risk posture, key findings, and strategic recommendations. Jargon-free and decision-focused.',                               tag: 'Board-ready' },
            { icon: '🔬', title: 'Full Technical Report',        desc: 'Step-by-step exploitation chains, proof-of-concept evidence, CVSS scoring, and detailed technical remediation guidance.',                            tag: 'Engineer-ready' },
            { icon: '🗺️', title: 'Remediation Roadmap',         desc: 'Prioritised action plan with effort/impact scoring, owner assignment templates, and a 30/60/90-day fix schedule.',                                    tag: 'Actionable' },
            { icon: '🎤', title: 'Live Debrief Session',         desc: 'Walkthrough of all findings with your security and engineering teams. Attack replay and Q&A for full knowledge transfer.',                             tag: 'Knowledge transfer' },
            { icon: '📡', title: 'Threat Intelligence Brief',    desc: 'Curated intelligence on threat actors most likely to target your sector, with indicators of compromise and attacker TTPs.',                             tag: 'Sector-specific' },
            { icon: '📊', title: 'Maturity Benchmarking',        desc: 'Your security posture benchmarked against industry peers using our proprietary scoring model across 12 capability domains.',                            tag: 'Benchmarked' },
            { icon: '✅', title: 'Re-test & Verification',       desc: 'Optional re-test of critical findings post-remediation, with a signed attestation letter confirming fix validation.',                                  tag: 'Optional add-on' },
            { icon: '🔐', title: 'Audit-Ready Documentation',    desc: 'Report formats compatible with ISO 27001, SOC 2, PCI-DSS, MAS TRM, DORA, and other regulatory frameworks.',                                          tag: 'Regulatory-ready' },
          ] : [
            { icon: '📋', title: 'Audit Report',   desc: 'Full findings with severity ratings, exploit scenarios, and fix guidance. Built for devs and investors alike.',                tag: 'Public-ready' },
            { icon: '🛡️', title: 'Security Badge', desc: 'Display it on your site, pitch deck, and docs. Instant trust signal to users, VCs, and exchange listing teams.',             tag: 'Display anywhere' },
            { icon: '⛓️', title: 'On-Chain Seal',  desc: 'Timestamped certificate, optionally hash-anchored on-chain. Covers exchange listings, grants, and VC due diligence.',       tag: 'Hash-anchored' },
          ]).map(d => (
            <div key={d.title} style={p.delCard}>
              <span style={{ fontSize: 28, marginBottom: 14, display: 'block' }}>{d.icon}</span>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{d.title}</div>
              <p style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.6 }}>{d.desc}</p>
              <span style={p.tag}>{d.tag}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ADD-ON SERVICES — smart contract only */}
      {type === 'smart_contract' && (
        <Section label="Add-On Services" title={<>Enhance Your <span style={{ color: '#4fffa4' }}>Audit Coverage</span></>}
          sub="Optional services to strengthen your security posture beyond the core audit.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🔀', title: 'Fuzzing as a Service',      desc: 'Automated property-based fuzzing using Echidna and Medusa. Uncovers edge-case vulnerabilities and unexpected state transitions that manual review can miss.', badge: 'Add-on · Quote on request', cta: true },
              { icon: '🛠️', title: 'Development Issues Review', desc: 'A thorough review of your development practices, code quality, test coverage, and CI/CD pipeline. We identify gaps in your SDLC that could introduce vulnerabilities post-audit.', badge: 'Service · Included on request', cta: false },
              { icon: '📜', title: 'Deployment Script Testing', desc: 'Review and testing of your deployment scripts, migration logic, and initialisation flows. Ensures your contracts deploy correctly and securely in production with no misconfigured state.', badge: 'Add-on · Quote on request', cta: true },
            ].map(item => (
              <div key={item.title} style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: 'monospace', background: item.cta ? 'rgba(245,197,66,0.08)' : 'rgba(79,255,164,0.08)', color: item.cta ? '#f5c542' : '#4fffa4', border: item.cta ? '1px solid rgba(245,197,66,0.2)' : '1px solid rgba(79,255,164,0.15)' }}>{item.badge}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.65, maxWidth: 560 }}>{item.desc}</p>
                </div>
                {item.cta && <a href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer" style={{ background: 'transparent', border: '1px solid rgba(79,255,164,0.3)', color: '#4fffa4', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'center' }}>Get a Quote →</a>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* VULNERABILITY COVERAGE */}
      {showVulnSection && (
        <Section label="Vulnerability Coverage"
          title={vulnRows ? <>{vulnRows.length} Categories<br /><span style={{ color: '#4fffa4' }}>Mapped to Standards</span></> : <><span style={{ color: '#4fffa4' }}>Custom</span> Vulnerability Coverage</>}
          sub="Every category we assess — with the specific checkpoints our auditors verify for each.">
          {vulnRows && (
            <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'auto', background: '#0d1120', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead><tr><th style={vt.th}>VULNERABILITY</th><th style={vt.th}>CHECKPOINTS</th></tr></thead>
                <tbody>
                  {vulnRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ ...vt.td, fontWeight: 700, width: '36%', verticalAlign: 'top' }}>{row.vuln || row.category}</td>
                      <td style={{ ...vt.td, verticalAlign: 'top' }}>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {row.checks.map((c, j) => <li key={j} style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.7, marginBottom: 2 }}>{c}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!vulnRows && customVulnRows.length > 0 && (
            <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'auto', background: '#0d1120', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead><tr><th style={vt.th}>CATEGORY</th><th style={vt.th}>CHECKPOINTS</th></tr></thead>
                <tbody>
                  {customVulnRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ ...vt.td, fontWeight: 700, width: '36%', verticalAlign: 'top' }}>{row.vuln || row.category}</td>
                      <td style={{ ...vt.td, verticalAlign: 'top' }}>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {(row.checks || []).map((c, j) => <li key={j} style={{ fontSize: 13, color: '#7a8a9e', lineHeight: 1.7, marginBottom: 2 }}>{c}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {type === 'smart_contract' && (
            <>
              <CollapsibleVulnTable title="Fuzzing as a Service — Coverage" icon="🔀" badge="Add-on" rows={FUZZ_VULNS} forceOpen={isPdf} />
              <CollapsibleVulnTable title="Multichain Deployment — Coverage" icon="🔗" badge="Add-on" rows={MULTICHAIN_VULNS} forceOpen={isPdf} />
            </>
          )}
        </Section>
      )}

      {/* SOCIAL PROOF */}
      <Section label="Social Proof" title={<>Trusted by <span style={{ color: '#4fffa4' }}>200+ Organisations</span></>}
        sub={isRedTeam ? "Our operators have conducted red team engagements across DeFi protocols, Web3 infrastructure, financial institutions, and regulated enterprises." : "We don't just say we're good. Here's the track record."}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden', marginBottom: 32 }}>
          {[
            { num: '2.5M+', label: 'Scans on SolidityScan' },
            { num: '200+',  label: 'Global clients across DeFi, NFT & RWA' },
            { num: '80+',   label: 'Blockchain platforms integrated' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0d1120', padding: '28px 24px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 30, fontWeight: 700, color: '#4fffa4', marginBottom: 6 }}>{s.num}</span>
              <span style={{ fontSize: 12, color: '#7a8a9e', lineHeight: 1.4 }}>{s.label}</span>
            </div>
          ))}
        </div>
        {[
          { quote: 'CredShields found a critical reentrancy vulnerability in our staking contract 48 hours before our mainnet launch. We would have lost everything. The team was sharp and actually understood our protocol architecture not just running a script.', author: 'Marcus K.', role: 'CTO, DeFi Lending Protocol' },
          { quote: isRedTeam
            ? 'The red team engagement was the most revealing exercise we\'ve conducted. They got further than we thought possible — through our Telegram admin account — in less than 72 hours. The remediation roadmap they delivered was worth ten times the engagement fee.'
            : 'The audit report was the first thing our lead investor asked for in due diligence. Having the CredShields badge and the on-chain seal reference in our data room closed that conversation immediately.',
            author: isRedTeam ? 'James R.' : 'Sarah L.',
            role: isRedTeam ? 'CISO, Web3 Financial Protocol' : 'Founder, RWA Tokenization Protocol' },
        ].map(t => (
          <div key={t.author} style={p.testimonial}>
            <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: 'italic', color: '#e8edf5' }}>&ldquo;{t.quote}&rdquo;</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4fffa4,#0d9e60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#080b12', flexShrink: 0 }}>
                {t.author.split(' ').map(w => w[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.author}</div>
                <div style={{ fontSize: 12, color: '#7a8a9e' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* PAST AUDITS / RED TEAM TRACK RECORD */}
      <Section label="Track Record" title={<>Selected <span style={{ color: '#4fffa4' }}>{isRedTeam ? 'Past Engagements' : 'Past Audits'}</span></>}
        sub={isRedTeam ? "We operate under strict NDAs. The following are anonymised summaries of completed engagements." : "We've protected protocols from pre-launch to post-listing across every major vertical."}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(isRedTeam ? [
            { name: 'DeFi Protocol Red Team',       tag: 'Web3 / DeFi',      tagStyle: p.tagDefi,  finding: 'Admin compromise via Telegram SIM-swap in 72h' },
            { name: 'Web3 Exchange Infrastructure', tag: 'Exchange / CeFi',  tagStyle: p.tagRwa,   finding: 'CI/CD pipeline → prod key access via supply chain' },
            { name: 'DAO Governance Red Team',      tag: 'Governance / DAO', tagStyle: p.tagStake, finding: 'Governance takeover via delegate manipulation' },
            { name: 'AI-Enabled Fintech',           tag: 'AI / LLM Risk',   tagStyle: p.tagNft,   finding: 'System prompt extraction → data exfiltration via RAG' },
          ] : [
            { name: 'Tribally Gaming Protocol',   tag: 'Gaming / NFT', tagStyle: p.tagNft,   finding: '2 Critical, 4 High bugs found' },
            { name: 'DeFi Lending Protocol',      tag: 'DeFi',         tagStyle: p.tagDefi,  finding: '1 Critical reentrancy pre-launch' },
            { name: 'RWA Tokenization Platform',  tag: 'RWA',          tagStyle: p.tagRwa,   finding: '3 High oracle manipulation vectors' },
            { name: 'Staking & Rewards Protocol', tag: 'Staking',      tagStyle: p.tagStake, finding: 'Flash loan + access control fixes' },
          ]).map(a => (
            <div key={a.name} style={p.auditRow}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{a.name}</div>
                <span style={{ ...p.auditTag, ...a.tagStyle }}>{a.tag}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#7a8a9e' }}>{a.finding}</span>
                {!isRedTeam && <a href="https://credshields.com/recently-audited?tab-name=recent" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#4fffa4', fontFamily: 'monospace', textDecoration: 'none' }}>View Report →</a>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PARTNERS */}
      <Section label="Partners & Integrations" title={<>Trusted Across the <span style={{ color: '#4fffa4' }}>Ecosystem</span></>}
        sub="Powered by SolidityScan — 2.5M+ scans completed, integrated across 80+ blockchain platforms.">
        <div style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/partners.svg" alt="CredShields Partners" style={{ width: '100%', height: 'auto', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
        </div>
      </Section>

      {/* CTA */}
      <div style={{ padding: '100px 0', textAlign: 'center', background: '#080b12' }}>
        <div style={p.wrap}>
          <div style={p.scarcityBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={p.greenDot} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {isRedTeam ? 'Confidential scoping calls available this week' : `${month} ${year} availability — 2 slots remaining`}
                </div>
                <div style={{ fontSize: 12, color: '#7a8a9e' }}>
                  {isRedTeam ? 'All initial consultations are NDA-protected. Response within 24 hours.' : 'We limit engagements per month to maintain quality. Slot secured with 50% deposit.'}
                </div>
              </div>
            </div>
            {!isRedTeam && (
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(255,79,106,0.3)', border: '1px solid rgba(255,79,106,0.4)' }} />)}
                {[4,5].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: 4, background: 'rgba(79,255,164,0.2)', border: '1px solid rgba(79,255,164,0.4)' }} />)}
              </div>
            )}
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px,5vw,44px)', lineHeight: 1.15, marginBottom: 16 }}>
            {isRedTeam ? <>Ready to know<br /><span style={{ color: '#4fffa4' }}>where you&apos;re exposed?</span></> : <>Your security. Your users.<br /><span style={{ color: '#4fffa4' }}>Your reputation.</span></>}
          </h2>
          <p style={{ fontSize: 17, color: '#7a8a9e', maxWidth: 500, fontWeight: 300, lineHeight: 1.7, margin: '0 auto 40px' }}>
            {isRedTeam
              ? "The first conversation is always confidential, no-obligation, and focused on your specific threat model. We'll help you determine the right engagement scope before any commitment."
              : "Don't ship unaudited. One exploited vulnerability undoes everything you've built, the community, the trust, the TVL."}
          </p>
          <a href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg,#4fffa4,#2de88a)', color: '#080b12', fontWeight: 800, fontSize: 16, padding: '16px 40px', borderRadius: 8, letterSpacing: '0.01em', textDecoration: 'none' }}>
            {isRedTeam ? '→ Book a Scoping Call' : '→ Book Your Audit Slot Now'}
          </a>
          <p style={{ marginTop: 20, fontSize: 13, color: '#7a8a9e' }}>
            Or DM directly on Telegram: <strong style={{ color: '#e8edf5' }}>@cred_shields</strong>, we respond within 2 hours.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={p.wrap}>
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <CredShieldsLogo height={34} />
          <p style={{ fontSize: 12, color: '#7a8a9e' }}>20A Tanjong Pagar Road, Singapore — 088443</p>
          <a href="https://credshields.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#7a8a9e', textDecoration: 'underline' }}>credshields.com</a>
        </footer>
      </div>

    </div>
  )
}

// ── CSS — exact from reference ─────────────────────────────────────────────────
const p = {
  page:           { background: '#080b12', color: '#e8edf5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  wrap:           { maxWidth: '860px', margin: '0 auto', padding: '0 32px' },
  cover:          { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  coverBg:        { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(79,255,164,0.07) 0%, transparent 70%)', pointerEvents: 'none' },
  coverGrid:      { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,255,164,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,255,164,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' },
  logoLine:       { marginBottom: '60px' },
  eyebrow:        { fontSize: '12px', letterSpacing: '0.2em', color: '#4fffa4', textTransform: 'uppercase', marginBottom: '20px', fontFamily: 'monospace' },
  coverTitle:     { fontWeight: 800, fontSize: 'clamp(42px,8vw,72px)', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '24px' },
  coverSub:       { fontSize: '17px', color: '#7a8a9e', maxWidth: '500px', marginBottom: '48px', fontWeight: 300, lineHeight: 1.7 },
  coverMeta:      { display: 'flex', gap: '40px', flexWrap: 'wrap' },
  metaLabel:      { fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a8a9e', marginBottom: '4px', fontFamily: 'monospace' },
  metaValue:      { fontSize: '15px', fontWeight: 500 },
  coverBadge:     { marginTop: '40px', display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(79,255,164,0.15)', background: 'rgba(79,255,164,0.04)', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', color: '#7a8a9e' },
  redDot:         { width: '8px', height: '8px', borderRadius: '50%', background: '#ff4f6a', display: 'inline-block', flexShrink: 0 },
  greenDot:       { width: '10px', height: '10px', borderRadius: '50%', background: '#4fffa4', display: 'inline-block', flexShrink: 0 },
  urgencyBar:     { background: 'linear-gradient(90deg,rgba(255,79,106,0.1),rgba(255,79,106,0.05))', border: '1px solid rgba(255,79,106,0.25)', borderRadius: '8px', padding: '16px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' },
  priceCard:      { border: '1px solid rgba(79,255,164,0.15)', borderRadius: '12px', overflow: 'hidden', background: '#0d1120' },
  priceCardHead:  { padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  discBadgeLg:    { background: 'rgba(79,255,164,0.1)', border: '1px solid rgba(79,255,164,0.15)', color: '#4fffa4', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontFamily: 'monospace' },
  priceTd:        { padding: '16px 28px', fontSize: '14px' },
  priceFooter:    { padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '20px', flexWrap: 'wrap' },
  priceFooterItem:{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7a8a9e' },
  delCard:        { background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '24px' },
  tag:            { marginTop: '14px', display: 'inline-block', background: 'rgba(79,255,164,0.08)', border: '1px solid rgba(79,255,164,0.15)', color: '#4fffa4', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontFamily: 'monospace' },
  testimonial:    { background: '#0d1120', borderLeft: '3px solid #4fffa4', borderRadius: '0 10px 10px 0', padding: '24px 28px', marginBottom: '20px' },
  auditRow:       { background: '#0d1120', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' },
  auditTag:       { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontFamily: 'monospace' },
  tagDefi:        { background: 'rgba(79,130,255,0.12)', color: '#7faeff', border: '1px solid rgba(79,130,255,0.2)' },
  tagNft:         { background: 'rgba(200,79,255,0.12)', color: '#d07aff', border: '1px solid rgba(200,79,255,0.2)' },
  tagRwa:         { background: 'rgba(255,200,79,0.12)', color: '#ffd07a', border: '1px solid rgba(255,200,79,0.2)' },
  tagStake:       { background: 'rgba(79,255,164,0.08)', color: '#4fffa4', border: '1px solid rgba(79,255,164,0.15)' },
  scarcityBar:    { background: 'linear-gradient(90deg,rgba(79,255,164,0.07),rgba(79,255,164,0.02))', border: '1px solid rgba(79,255,164,0.15)', borderRadius: '8px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '40px', textAlign: 'left' },
}

const g = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(8,11,18,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' },
  box:     { background: '#0d1120', border: '1px solid rgba(79,255,164,0.2)', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '440px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  icon:    { fontSize: '36px' },
  title:   { fontSize: '24px', fontWeight: 800, color: '#e8edf5', lineHeight: 1.2 },
  sub:     { fontSize: '15px', color: '#7a8a9e', lineHeight: 1.7, maxWidth: '340px' },
  input:   { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '14px 18px', color: '#e8edf5', fontSize: '15px', width: '100%', outline: 'none', textAlign: 'center', boxSizing: 'border-box' },
  btn:     { background: 'linear-gradient(135deg,#4fffa4,#2de88a)', color: '#080b12', border: 'none', padding: '14px 32px', borderRadius: '8px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', width: '100%' },
  error:   { color: '#ff4f6a', fontSize: '13px', marginTop: '-8px' },
  privacy: { fontSize: '12px', color: '#7a8a9e', marginTop: '-4px' },
}