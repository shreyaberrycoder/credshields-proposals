'use client'
import { useState, useEffect } from 'react'

export default function ProposalClient({ proposal }) {
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const storageKey = `cs_unlocked_${proposal.id}`

  // Track view on mount. Check if already unlocked.
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: proposal.id }),
    })
    if (localStorage.getItem(storageKey) === 'true') setUnlocked(true)
  }, [proposal.id, storageKey])

  const submitEmail = async () => {
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.')
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId: proposal.id, email }),
    })
    if (res.ok) {
      localStorage.setItem(storageKey, 'true')
      setUnlocked(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const disc = Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100)

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>

      {/* ── EMAIL GATE ──────────────────────────────────────────────── */}
      {!unlocked && (
        <div style={g.gateOverlay}>
          <div style={g.gateBox}>
            <div style={g.gateLogo}>CRED<span style={{color:'#4fffa4'}}>SHIELDS</span></div>
            <div style={g.gateIcon}>🔒</div>
            <h2 style={g.gateTitle}>Your Proposal is Ready</h2>
            <p style={g.gateSub}>
              Enter your work email to access the full security audit proposal
              prepared for <strong style={{color:'#e8edf5'}}>{proposal.company}</strong>.
            </p>
            <input
              style={g.gateInput}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && submitEmail()}
              autoFocus
            />
            {error && <p style={g.gateError}>{error}</p>}
            <button style={g.gateBtn} onClick={submitEmail} disabled={submitting}>
              {submitting ? 'Unlocking...' : 'View Proposal →'}
            </button>
            <p style={g.gatePrivacy}>🔐 Your email is only shared with the CredShields team.</p>
          </div>
        </div>
      )}

      {/* ── PROPOSAL ────────────────────────────────────────────────── */}
      <div style={{ filter: unlocked ? 'none' : 'blur(6px)', pointerEvents: unlocked ? 'auto' : 'none', userSelect: unlocked ? 'auto' : 'none' }}>
        <ProposalContent proposal={proposal} disc={disc} />
      </div>
    </div>
  )
}

// ── Full Proposal Design ─────────────────────────────────────────────────────
function ProposalContent({ proposal, disc }) {
  const fmt = (n) => n.toLocaleString()

  return (
    <div style={p.page}>

      {/* Cover */}
      <div style={p.cover}>
        <div style={p.coverBg} />
        <div style={p.coverGrid} />
        <div style={p.wrap}>
          <div style={p.logoLine}>
            <div style={p.shield} />
            <div style={p.logoText}>CRED<span style={{color:'#4fffa4'}}>SHIELDS</span></div>
          </div>
          <div style={p.eyebrow}>— Smart Contract Audit Proposal</div>
          <h1 style={p.coverTitle}>Security<br/>Audit<br/><span style={{color:'#4fffa4'}}>Proposal</span></h1>
          <p style={p.coverSub}>
            Prepared exclusively for <strong style={{color:'#e8edf5'}}>{proposal.client_name}</strong> at{' '}
            <strong style={{color:'#e8edf5'}}>{proposal.company}</strong> — Capital Pool System Update.
          </p>
          <div style={p.coverMeta}>
            {[
              { label:'Prepared by', value:'CredShields Technologies Pte. Ltd.' },
              { label:'Scope', value:`${proposal.company} — Capital Pool` },
              { label:'Final Price', value:`$${fmt(proposal.final_price)} USD`, green: true },
            ].map(m => (
              <div key={m.label}>
                <div style={p.metaLabel}>{m.label}</div>
                <div style={{...p.metaValue, ...(m.green ? {color:'#4fffa4', fontFamily:'monospace'} : {})}}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={p.coverBadge}>
            <span style={p.redDot} />
            Only 2 audit slots remaining in March — availability is limited
          </div>
        </div>
      </div>

      {/* Pricing */}
      <Section label="Scope & Pricing" title={<>Your Audit, <span style={{color:'#4fffa4'}}>Scoped & Priced</span></>}
        sub="Everything included. No surprises. 50% to start, 50% after retest — paid only when you're satisfied with the fixes.">
        <div style={p.urgencyBar}>
          <span style={{fontSize:'18px'}}>⚠️</span>
          <p style={{fontSize:'14px', color:'#ffb3be'}}>
            <strong style={{color:'#ff4f6a'}}>$2.8B+ was lost to smart contract exploits in 2024.</strong>{' '}
            An audit at this stage is the highest-ROI security investment your protocol will ever make.
          </p>
        </div>
        <div style={p.priceCard}>
          <div style={p.priceCardHeader}>
            <span style={{fontWeight:700, fontSize:'16px'}}>{proposal.company} — {proposal.scope_description?.split(' ').slice(0,6).join(' ')}...</span>
            <span style={p.discBadge}>{disc}% DISCOUNT APPLIED</span>
          </div>
          <table style={p.priceTable}>
            <tbody>
              {[
                ['Contracts in Scope', `${proposal.company} Protocol`],
                ['Lines of Code', fmt(proposal.loc)],
                ['Audit Duration', `${proposal.days} Business Days`],
                ['Standard Price', null, `$${fmt(proposal.original_price)} USD`],
              ].map(([label, val, strike]) => (
                <tr key={label} style={p.priceRow}>
                  <td style={p.priceTd}><span style={{color:'#7a8a9e', fontSize:'13px'}}>{label}</span></td>
                  <td style={{...p.priceTd, textAlign:'right'}}>
                    {strike ? <span style={{textDecoration:'line-through', color:'#7a8a9e', fontSize:'13px'}}>{strike}</span> : val}
                  </td>
                </tr>
              ))}
              <tr style={{background:'rgba(79,255,164,0.04)'}}>
                <td style={{...p.priceTd, fontSize:'18px', fontWeight:700}}>Your Price</td>
                <td style={{...p.priceTd, textAlign:'right', fontSize:'22px', fontWeight:700, color:'#4fffa4', fontFamily:'monospace'}}>
                  ${fmt(proposal.final_price)} USD
                </td>
              </tr>
            </tbody>
          </table>
          <div style={p.priceFooter}>
            {['50% upfront · 50% before retest', 'USDC via Ethereum, Base, or Polygon', 'Fiat accepted', 'Free 3-month retest window'].map(t => (
              <span key={t} style={p.priceFooterItem}><span style={{color:'#4fffa4'}}>✓</span> {t}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Timeline */}
      <Section label="Audit Timeline" title={<>Done in <span style={{color:'#4fffa4'}}>{proposal.days} Days</span></>}
        sub="Fast without cutting corners. Here's exactly what happens and when.">
        <div style={p.timeline}>
          {[
            { day:'Day 1',   title:'Scope & Kickoff',         desc:'Align on objectives, contracts in scope, and timeline. Repo access granted. Slot locked with 50% deposit.' },
            { day:'Day 2–3', title:'Manual + AI Review',      desc:'Line-by-line manual review combined with SolidityScan AI engine. All findings cross-validated by senior auditors — zero false positives.' },
            { day:'Day 4',   title:'Draft Report Delivered',  desc:'All findings with severity ratings, exploit scenarios, and fix recommendations. Readable by devs and non-technical stakeholders.' },
            { day:'Day 5',   title:'Your Team Applies Fixes', desc:'We're on Telegram/Discord to answer questions and review proposed solutions during remediation.' },
            { day:'Day 6',   title:'Retest + Certification',  desc:'We verify every fix, check for new issues, and issue your public audit report, security badge, and on-chain seal.' },
          ].map((item, i) => (
            <div key={i} style={p.tlItem}>
              <div style={p.tlDay}>
                <span>{item.day}</span>
                {i < 4 && <div style={p.tlLine} />}
              </div>
              <div style={p.tlContent}>
                <div style={p.tlTitle}>{item.title}</div>
                <div style={p.tlDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* What You Get */}
      <Section label="Deliverables" title={<>What You <span style={{color:'#4fffa4'}}>Walk Away With</span></>}
        sub="Three compounding credibility assets — not just a PDF.">
        <div style={p.delGrid}>
          {[
            { icon:'📋', title:'Audit Report', desc:'Full findings with severity ratings, exploit scenarios, and fix guidance. Built for devs and investors alike.', tag:'Public-ready' },
            { icon:'🛡️', title:'Security Badge', desc:'Display it on your site, pitch deck, and docs. Instant trust signal to users, VCs, and exchange listing teams.', tag:'Display anywhere' },
            { icon:'⛓️', title:'On-Chain Seal', desc:'Timestamped certificate, optionally hash-anchored on-chain. Covers exchange listings, grants, and VC due diligence.', tag:'Hash-anchored' },
          ].map(d => (
            <div key={d.title} style={p.delCard}>
              <span style={{fontSize:'28px', marginBottom:'14px', display:'block'}}>{d.icon}</span>
              <div style={p.delTitle}>{d.title}</div>
              <p style={p.delDesc}>{d.desc}</p>
              <span style={p.delTag}>{d.tag}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section label="Social Proof" title={<>Trusted by <span style={{color:'#4fffa4'}}>200+ Protocols</span></>}
        sub="We don't just say we're good. Here's the track record.">
        <div style={p.statsRow}>
          {[
            { num:'2.5M+', label:'Scans on SolidityScan' },
            { num:'200+',  label:'Global clients: DeFi, NFT & RWA' },
            { num:'80+',   label:'Blockchain platforms integrated' },
          ].map(s => (
            <div key={s.label} style={p.statCard}>
              <span style={p.statNum}>{s.num}</span>
              <span style={p.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {[
          { quote: "CredShields found a critical reentrancy vulnerability in our staking contract 48 hours before our mainnet launch. We would have lost everything. The team was sharp and actually understood our protocol architecture — not just running a script.", author: "Marcus K.", role: "CTO, DeFi Lending Protocol" },
          { quote: "The audit report was the first thing our lead investor asked for in due diligence. Having the CredShields badge and the on-chain seal reference in our data room closed that conversation immediately.", author: "Sarah L.", role: "Founder, RWA Tokenization Protocol" },
        ].map(t => (
          <div key={t.author} style={p.testimonial}>
            <p style={p.quote}>"{t.quote}"</p>
            <div style={{display:'flex', alignItems:'center', gap:'12px', marginTop:'16px'}}>
              <div style={p.avatar}>{t.author.split(' ').map(w=>w[0]).join('')}</div>
              <div>
                <div style={{fontSize:'13px', fontWeight:600}}>{t.author}</div>
                <div style={{fontSize:'12px', color:'#7a8a9e'}}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* Methodology */}
      <Section label="Methodology" title={<>How We <span style={{color:'#4fffa4'}}>Find What Others Miss</span></>}
        sub="AI speed. Human depth. Zero false positives.">
        <div style={p.methodGrid}>
          {[
            { icon:'🔍', title:'Manual Review',     desc:'Every line inspected for logic flaws, access control issues, economic attack vectors, and protocol-level risks automation cannot catch.' },
            { icon:'🤖', title:'SolidityScan AI',   desc:'Our engine cross-references 60,000+ known vulnerabilities across 1,000+ rules. Every finding is manually validated before it reaches your report.' },
            { icon:'💣', title:'Exploit Simulation',desc:'We write PoC exploit code to prove exploitability. You get reproduction steps, logs, and screenshots for every critical finding.' },
            { icon:'🔁', title:'Retest & Regression',desc:'After your team applies fixes, we re-run the full test suite, check for newly introduced issues, and validate overall security posture.' },
          ].map(m => (
            <div key={m.title} style={p.methodCard}>
              <div style={p.methodTitle}>{m.icon} {m.title}</div>
              <p style={p.methodDesc}>{m.desc}</p>
            </div>
          ))}
        </div>
        <div style={p.coverageBar}>
          Our audit covers <strong style={{color:'#e8edf5'}}>13 vulnerability categories</strong> including reentrancy, flash loan exploits, oracle manipulation, access control flaws, and economic attack surfaces — mapped to the <strong style={{color:'#e8edf5'}}>OWASP Smart Contract Top 10</strong> standard, which our team helped draft.
        </div>
      </Section>

      {/* Comparison */}
      <Section label="Why CredShields" title={<>How We Compare to <span style={{color:'#4fffa4'}}>Other Auditors</span></>}
        sub="You're comparing. We want you to.">
        <div style={p.compareWrap}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['', 'CredShields ✦', 'Hacken', 'CertiK', 'Trail of Bits'].map((h,i) => (
                  <th key={h} style={{...p.cth, ...(i===1 ? {color:'#4fffa4'} : {})}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Price', `$${fmt(proposal.final_price)}`, '$8,000–$15,000', '$10,000–$25,000', '$30,000+'],
                ['Turnaround', `${proposal.days} days`, '2–3 weeks', '2–4 weeks', '4–8 weeks'],
                ['Free retest', '✓ 3 months', 'Paid extra', 'Limited', 'Paid extra'],
                ['On-chain seal', '✓ Included', '✗', '✗', '✗'],
                ['OWASP mapped', '✓ Co-authored', '✓', '✓', 'Partial'],
                ['Direct DM support', '✓ Telegram', 'Ticket', 'Ticket', 'Email'],
              ].map(([label, us, ...rest]) => (
                <tr key={label} style={p.cRow}>
                  <td style={p.ctd}>{label}</td>
                  <td style={{...p.ctd, background:'rgba(79,255,164,0.03)', color: us.startsWith('$') || us.startsWith('✓') ? '#4fffa4' : '#e8edf5', fontWeight: us.startsWith('$') ? 700 : 400, fontFamily: us.startsWith('$') ? 'monospace' : 'inherit'}}>
                    {us}
                  </td>
                  {rest.map(v => <td key={v} style={{...p.ctd, color: v === '✗' ? '#ff4f6a' : '#7a8a9e'}}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* CTA */}
      <div style={p.ctaSection}>
        <div style={p.wrap}>
          <div style={p.scarcityBar}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
              <span style={p.greenDot} />
              <div>
                <div style={{fontSize:'14px', fontWeight:600}}>March availability — 2 slots remaining</div>
                <div style={{fontSize:'12px', color:'#7a8a9e'}}>We limit audits per month to maintain quality. Slot secured with 50% deposit.</div>
              </div>
            </div>
            <div style={{display:'flex', gap:'6px'}}>
              {[1,2,3].map(i => <div key={i} style={p.slotTaken} />)}
              {[4,5].map(i => <div key={i} style={p.slotOpen} />)}
            </div>
          </div>

          <h2 style={{fontWeight:800, fontSize:'clamp(28px,5vw,44px)', lineHeight:1.15, marginBottom:'16px'}}>
            Your contracts. Your users.<br/><span style={{color:'#4fffa4'}}>Your reputation.</span>
          </h2>
          <p style={{fontSize:'17px', color:'#7a8a9e', marginBottom:'40px', maxWidth:'500px', fontWeight:300}}>
            Don't ship unaudited. One exploited vulnerability undoes everything you've built — the community, the trust, the TVL.
          </p>
          <a href="https://calendly.com/credshields" target="_blank" rel="noreferrer" style={p.ctaBtn}>
            → Book Your Audit Slot Now
          </a>
          <p style={{marginTop:'20px', fontSize:'13px', color:'#7a8a9e'}}>
            Or DM directly on Telegram: <strong style={{color:'#e8edf5'}}>@CredShields</strong> — we respond within 2 hours.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={p.wrap}>
        <footer style={p.footer}>
          <div style={{fontWeight:800, fontSize:'14px', letterSpacing:'0.05em'}}>
            CRED<span style={{color:'#4fffa4'}}>SHIELDS</span> Technologies Pte. Ltd.
          </div>
          <p style={{fontSize:'12px', color:'#7a8a9e'}}>20A Tanjong Pagar Road, Singapore — 088443</p>
          <p style={{fontSize:'12px', color:'#7a8a9e'}}>credshields.com</p>
        </footer>
      </div>
    </div>
  )
}

// ── Reusable Section Wrapper ─────────────────────────────────────────────────
function Section({ label, title, sub, children }) {
  return (
    <section style={p.section}>
      <div style={p.wrap}>
        <div style={p.sectionLabel}>{label}</div>
        <h2 style={p.h2}>{title}</h2>
        {sub && <p style={p.lead}>{sub}</p>}
        {children}
      </div>
    </section>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const p = {
  page:          { background:'#080b12', color:'#e8edf5', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  wrap:          { maxWidth:'860px', margin:'0 auto', padding:'0 32px' },

  // Cover
  cover:         { minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', overflow:'hidden', padding:'80px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  coverBg:       { position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(79,255,164,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(45,232,138,0.04) 0%, transparent 60%)', pointerEvents:'none' },
  coverGrid:     { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(79,255,164,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,255,164,0.03) 1px, transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' },
  logoLine:      { display:'flex', alignItems:'center', gap:'10px', marginBottom:'60px' },
  shield:        { width:'38px', height:'38px', background:'linear-gradient(135deg, #4fffa4, #2de88a)', clipPath:'polygon(50% 0%, 100% 20%, 100% 75%, 50% 100%, 0% 75%, 0% 20%)' },
  logoText:      { fontWeight:800, fontSize:'18px', letterSpacing:'0.1em', color:'#fff' },
  eyebrow:       { fontSize:'12px', letterSpacing:'0.2em', color:'#4fffa4', textTransform:'uppercase', marginBottom:'20px', fontFamily:'monospace' },
  coverTitle:    { fontWeight:800, fontSize:'clamp(42px,8vw,72px)', lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:'24px' },
  coverSub:      { fontSize:'17px', color:'#7a8a9e', maxWidth:'500px', marginBottom:'48px', fontWeight:300, lineHeight:1.7 },
  coverMeta:     { display:'flex', gap:'40px', flexWrap:'wrap' },
  metaLabel:     { fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'#7a8a9e', marginBottom:'4px', fontFamily:'monospace' },
  metaValue:     { fontSize:'15px', fontWeight:500 },
  coverBadge:    { marginTop:'40px', display:'inline-flex', alignItems:'center', gap:'10px', border:'1px solid rgba(79,255,164,0.15)', background:'rgba(79,255,164,0.04)', padding:'10px 18px', borderRadius:'6px', fontSize:'13px', color:'#7a8a9e' },
  redDot:        { width:'8px', height:'8px', borderRadius:'50%', background:'#ff4f6a', display:'inline-block', flexShrink:0 },
  greenDot:      { width:'10px', height:'10px', borderRadius:'50%', background:'#4fffa4', display:'inline-block', flexShrink:0 },

  // Section
  section:       { padding:'80px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  sectionLabel:  { fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#4fffa4', marginBottom:'12px', fontFamily:'monospace' },
  h2:            { fontWeight:800, fontSize:'clamp(26px,4vw,38px)', letterSpacing:'-0.01em', marginBottom:'16px', lineHeight:1.15 },
  lead:          { fontSize:'16px', color:'#7a8a9e', maxWidth:'580px', marginBottom:'40px', fontWeight:300, lineHeight:1.8 },

  // Urgency
  urgencyBar:    { background:'linear-gradient(90deg, rgba(255,79,106,0.1), rgba(255,79,106,0.05))', border:'1px solid rgba(255,79,106,0.25)', borderRadius:'8px', padding:'16px 24px', marginBottom:'28px', display:'flex', alignItems:'center', gap:'16px' },

  // Price card
  priceCard:     { border:'1px solid rgba(79,255,164,0.15)', borderRadius:'12px', overflow:'hidden', background:'#0d1120' },
  priceCardHeader: { padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' },
  discBadge:     { background:'rgba(79,255,164,0.1)', border:'1px solid rgba(79,255,164,0.15)', color:'#4fffa4', padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontFamily:'monospace' },
  priceTable:    { width:'100%', borderCollapse:'collapse' },
  priceRow:      { borderBottom:'1px solid rgba(255,255,255,0.05)' },
  priceTd:       { padding:'16px 28px', fontSize:'14px' },
  priceFooter:   { padding:'16px 28px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', display:'flex', gap:'20px', flexWrap:'wrap' },
  priceFooterItem: { display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#7a8a9e' },

  // Timeline
  timeline:      { display:'flex', flexDirection:'column', gap:'0' },
  tlItem:        { display:'grid', gridTemplateColumns:'90px 1fr', gap:'0 24px', position:'relative' },
  tlDay:         { fontSize:'11px', color:'#4fffa4', fontFamily:'monospace', paddingTop:'4px', textAlign:'right', paddingRight:'24px', position:'relative' },
  tlLine:        { position:'absolute', right:'-1px', top:'20px', bottom:'-28px', width:'1px', background:'rgba(255,255,255,0.07)' },
  tlContent:     { paddingBottom:'32px' },
  tlTitle:       { fontWeight:600, fontSize:'15px', marginBottom:'4px' },
  tlDesc:        { fontSize:'13px', color:'#7a8a9e', lineHeight:1.6 },

  // Deliverables
  delGrid:       { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' },
  delCard:       { background:'#0d1120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'24px' },
  delTitle:      { fontWeight:700, fontSize:'15px', marginBottom:'8px' },
  delDesc:       { fontSize:'13px', color:'#7a8a9e', lineHeight:1.6 },
  delTag:        { marginTop:'14px', display:'inline-block', background:'rgba(79,255,164,0.08)', border:'1px solid rgba(79,255,164,0.15)', color:'#4fffa4', fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontFamily:'monospace' },

  // Stats
  statsRow:      { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', overflow:'hidden', marginBottom:'32px' },
  statCard:      { background:'#0d1120', padding:'28px 24px', textAlign:'center' },
  statNum:       { display:'block', fontFamily:'monospace', fontSize:'30px', fontWeight:700, color:'#4fffa4', marginBottom:'6px' },
  statLabel:     { fontSize:'12px', color:'#7a8a9e', lineHeight:1.4 },

  // Testimonial
  testimonial:   { background:'#0d1120', borderLeft:'3px solid #4fffa4', borderRadius:'0 10px 10px 0', padding:'24px 28px', marginBottom:'20px' },
  quote:         { fontSize:'15px', lineHeight:1.7, fontStyle:'italic', color:'#e8edf5' },
  avatar:        { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg, #4fffa4, #0d9e60)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color:'#080b12', flexShrink:0 },

  // Methodology
  methodGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' },
  methodCard:    { background:'#0d1120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'24px' },
  methodTitle:   { fontWeight:700, fontSize:'15px', marginBottom:'10px' },
  methodDesc:    { fontSize:'13px', color:'#7a8a9e', lineHeight:1.65 },
  coverageBar:   { background:'#0d1120', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'20px 24px', fontSize:'14px', color:'#7a8a9e', lineHeight:1.8 },

  // Compare
  compareWrap:   { border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', overflow:'auto', background:'#0d1120' },
  cth:           { padding:'14px 20px', textAlign:'left', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#7a8a9e', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap', fontFamily:'monospace' },
  ctd:           { padding:'14px 20px', fontSize:'13px', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  cRow:          {},

  // CTA
  ctaSection:    { padding:'100px 0', textAlign:'center' },
  scarcityBar:   { background:'linear-gradient(90deg, rgba(79,255,164,0.07), rgba(79,255,164,0.02))', border:'1px solid rgba(79,255,164,0.15)', borderRadius:'8px', padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'40px', textAlign:'left' },
  slotTaken:     { width:'28px', height:'28px', borderRadius:'4px', background:'rgba(255,79,106,0.3)', border:'1px solid rgba(255,79,106,0.4)' },
  slotOpen:      { width:'28px', height:'28px', borderRadius:'4px', background:'rgba(79,255,164,0.2)', border:'1px solid rgba(79,255,164,0.4)' },
  ctaBtn:        { display:'inline-block', background:'linear-gradient(135deg, #4fffa4, #2de88a)', color:'#080b12', fontWeight:800, fontSize:'16px', padding:'16px 40px', borderRadius:'8px', letterSpacing:'0.01em', cursor:'pointer' },

  // Footer
  footer:        { display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px', padding:'32px 0', borderTop:'1px solid rgba(255,255,255,0.07)' },
}

// ── Gate Styles ──────────────────────────────────────────────────────────────
const g = {
  gateOverlay:   { position:'fixed', inset:0, background:'rgba(8,11,18,0.92)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:'20px' },
  gateBox:       { background:'#0d1120', border:'1px solid rgba(79,255,164,0.2)', borderRadius:'16px', padding:'48px 40px', width:'100%', maxWidth:'440px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' },
  gateLogo:      { fontWeight:800, fontSize:'18px', letterSpacing:'0.08em', color:'#fff', marginBottom:'4px' },
  gateIcon:      { fontSize:'36px' },
  gateTitle:     { fontSize:'24px', fontWeight:800, color:'#e8edf5', lineHeight:1.2 },
  gateSub:       { fontSize:'15px', color:'#7a8a9e', lineHeight:1.7, maxWidth:'340px' },
  gateInput:     { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', padding:'14px 18px', color:'#e8edf5', fontSize:'15px', width:'100%', outline:'none', textAlign:'center' },
  gateBtn:       { background:'linear-gradient(135deg, #4fffa4, #2de88a)', color:'#080b12', border:'none', padding:'14px 32px', borderRadius:'8px', fontWeight:800, fontSize:'16px', cursor:'pointer', width:'100%', letterSpacing:'0.01em' },
  gateError:     { color:'#ff4f6a', fontSize:'13px', marginTop:'-8px' },
  gatePrivacy:   { fontSize:'12px', color:'#7a8a9e', marginTop:'-4px' },
}
