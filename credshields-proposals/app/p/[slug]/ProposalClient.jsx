'use client'
import { useState, useEffect } from 'react'
import CredShieldsLogo from '../../../components/Logo'
import { PROPOSAL_TYPES, DEFAULT_TIMELINES, VULNERABILITIES } from '../../../lib/proposalTypes'
import { PARTNER_LOGOS } from '../../../components/PartnerLogos'

export default function ProposalClient({ proposal }) {
  const [unlocked,   setUnlocked]   = useState(false)
  const [email,      setEmail]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const storageKey = `cs_unlocked_${proposal.id}`

  useEffect(() => {
    fetch('/api/views', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ proposalId: proposal.id }),
    })
    if (localStorage.getItem(storageKey) === 'true') setUnlocked(true)
  }, [proposal.id, storageKey])

  const submitEmail = async () => {
    if (!email || !email.includes('@')) return setError('Please enter a valid email address.')
    setSubmitting(true); setError('')
    const res = await fetch('/api/leads', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ proposalId: proposal.id, email }),
    })
    if (res.ok) { localStorage.setItem(storageKey,'true'); setUnlocked(true) }
    else setError('Something went wrong. Please try again.')
    setSubmitting(false)
  }

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      {!unlocked && (
        <div style={g.overlay}>
          <div style={g.box}>
            <CredShieldsLogo height={40} style={{ marginBottom:'8px' }} />
            <div style={g.icon}>🔒</div>
            <h2 style={g.title}>Your Proposal is Ready</h2>
            <p style={g.sub}>
              Enter your work email to access the full audit proposal prepared for{' '}
              <strong style={{color:'#e8edf5'}}>{proposal.company}</strong>.
            </p>
            <input style={g.input} type="email" placeholder="you@company.com"
              value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && submitEmail()} autoFocus />
            {error && <p style={g.error}>{error}</p>}
            <button style={g.btn} onClick={submitEmail} disabled={submitting}>
              {submitting ? 'Unlocking...' : 'View Proposal →'}
            </button>
            <p style={g.privacy}>🔐 Your email is only shared with the CredShields team.</p>
          </div>
        </div>
      )}
      <div style={{ filter: unlocked ? 'none' : 'blur(6px)', pointerEvents: unlocked ? 'auto' : 'none', userSelect: unlocked ? 'auto' : 'none' }}>
        <ProposalContent proposal={proposal} />
      </div>
    </div>
  )
}

function ProposalContent({ proposal }) {
  const fmt    = (n) => Number(n).toLocaleString()
  const type   = proposal.proposal_type || 'smart_contract'
  const config = PROPOSAL_TYPES[type] || PROPOSAL_TYPES.smart_contract
  const disc   = Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100)
  const month  = new Date(proposal.created_at).toLocaleString('default', { month:'long' })
  const year   = new Date(proposal.created_at).getFullYear()

  let timeline = DEFAULT_TIMELINES[type] || DEFAULT_TIMELINES.smart_contract
  if (proposal.custom_timeline) {
    try { timeline = JSON.parse(proposal.custom_timeline) } catch(e) {}
  }

  const price    = proposal.final_price
  const compRows = config.competitors.map(c => ({
    name:    c.name,
    price:   `$${fmt(Math.round(price * c.mult[0]))} - $${fmt(Math.round(price * c.mult[1]))}`,
    days:    c.days,
    retest:  c.retest,
    seal:    c.seal,
    owasp:   c.owasp,
    support: c.support,
  }))

  // Vulnerability coverage — auto for SC/WebApp, custom for others
  const vulnData = VULNERABILITIES[type] || null
  let customVulnRows = []
  if (!vulnData && proposal.custom_vulnerabilities) {
    try { customVulnRows = JSON.parse(proposal.custom_vulnerabilities) } catch(e) {}
  }
  const showVulnSection = vulnData || customVulnRows.length > 0

  return (
    <div style={p.page}>

      {/* ── COVER ── */}
      <div style={p.cover}>
        <div style={p.coverBg} /><div style={p.coverGrid} />
        <div style={p.wrap}>
          <div style={p.logoLine}><CredShieldsLogo height={52} /></div>
          <div style={p.eyebrow}>— {config.eyebrow}</div>
          <h1 style={p.coverTitle}>
            {type === 'smart_contract' && <>Security<br/>Audit<br/><span style={{color:'#4fffa4'}}>Proposal</span></>}
            {type === 'web_app'        && <>Web App<br/>Security<br/><span style={{color:'#4fffa4'}}>Audit</span></>}
            {type === 'mobile'         && <>Mobile App<br/>Security<br/><span style={{color:'#4fffa4'}}>Audit</span></>}
            {type === 'traditional'    && <>Security<br/>Audit<br/><span style={{color:'#4fffa4'}}>Proposal</span></>}
          </h1>
          <p style={p.coverSub}>
            Prepared exclusively for <strong style={{color:'#e8edf5'}}>{proposal.client_name}</strong> at{' '}
            <strong style={{color:'#e8edf5'}}>{proposal.company}</strong>.
          </p>
          <div style={p.coverMeta}>
            {[
              { label:'Prepared by', value:'CredShields Technologies Pte. Ltd.' },
              { label:'Scope',       value:`${proposal.company}` },
              { label:'Final Price', value:`$${fmt(proposal.final_price)} USD`, green:true },
            ].map(m => (
              <div key={m.label}>
                <div style={p.metaLabel}>{m.label}</div>
                <div style={{...p.metaValue, ...(m.green?{color:'#4fffa4',fontFamily:'monospace'}:{})}}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={p.coverBadge}>
            <span style={p.redDot} />
            Only 2 audit slots remaining in {month} — availability is limited
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <Section label="Scope & Pricing" title={<>Your Audit, <span style={{color:'#4fffa4'}}>Scoped & Priced</span></>}
        sub="Everything included. No surprises. 50% to start, 50% after retest. Paid only when you're satisfied with the fixes.">
        <div style={p.urgencyBar}>
          <span style={{fontSize:'18px'}}>⚠️</span>
          <p style={{fontSize:'14px',color:'#ffb3be'}}>
            <strong style={{color:'#ff4f6a'}}>{config.urgency}</strong>
          </p>
        </div>
        <div style={p.priceCard}>
          <div style={p.priceCardHead}>
            <span style={{fontWeight:700,fontSize:'16px'}}>{proposal.company} — {proposal.scope_description?.split(' ').slice(0,6).join(' ')}...</span>
            <span style={p.discBadgeLg}>{disc}% DISCOUNT APPLIED</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <tbody>
              {[
                ['Contracts in Scope', `${proposal.company} Protocol`],
                ['Lines of Code / Scope', fmt(proposal.loc)],
                ['Audit Duration', `${proposal.days} Business Days`],
                ['Standard Price', null, `$${fmt(proposal.original_price)} USD`],
              ].map(([label, val, strike]) => (
                <tr key={label} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={p.priceTd}><span style={{color:'#7a8a9e',fontSize:'13px'}}>{label}</span></td>
                  <td style={{...p.priceTd,textAlign:'right'}}>
                    {strike ? <span style={{textDecoration:'line-through',color:'#7a8a9e',fontSize:'13px'}}>{strike}</span> : val}
                  </td>
                </tr>
              ))}
              <tr style={{background:'rgba(79,255,164,0.04)'}}>
                <td style={{...p.priceTd,fontSize:'18px',fontWeight:700}}>Your Price</td>
                <td style={{...p.priceTd,textAlign:'right',fontSize:'22px',fontWeight:700,color:'#4fffa4',fontFamily:'monospace'}}>
                  ${fmt(proposal.final_price)} USD
                </td>
              </tr>
            </tbody>
          </table>
          <div style={p.priceFooter}>
            {['50% upfront, 50% before retest','USDC via Ethereum, Base, or Polygon','Fiat accepted','Free 3-month retest window'].map(t=>(
              <span key={t} style={p.priceFooterItem}><span style={{color:'#4fffa4'}}>✓</span> {t}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* ── TIMELINE ── */}
      <Section label="Audit Timeline" title={<>Done in <span style={{color:'#4fffa4'}}>{proposal.days} Days</span></>}
        sub="Fast without cutting corners. Here is exactly what happens and when.">
        <div>
          {timeline.map((item, i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'0 24px',position:'relative'}}>
              <div style={{fontSize:'11px',color:'#4fffa4',fontFamily:'monospace',paddingTop:'4px',textAlign:'right',paddingRight:'24px',position:'relative'}}>
                {item.day}
                {i < timeline.length - 1 && <div style={{position:'absolute',right:'-1px',top:'20px',bottom:'-28px',width:'1px',background:'rgba(255,255,255,0.07)'}}/>}
              </div>
              <div style={{paddingBottom:'32px'}}>
                <div style={{fontWeight:600,fontSize:'15px',marginBottom:'4px'}}>{item.title}</div>
                <div style={{fontSize:'13px',color:'#7a8a9e',lineHeight:1.6}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── DELIVERABLES ── */}
      <Section label="Deliverables" title={<>What You <span style={{color:'#4fffa4'}}>Walk Away With</span></>}
        sub="Three compounding credibility assets not just a PDF.">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {icon:'📋',title:'Audit Report',   desc:'Full findings with severity ratings, exploit scenarios, and fix guidance. Built for devs and investors alike.',tag:'Public-ready'},
            {icon:'🛡️',title:'Security Badge', desc:'Display it on your site, pitch deck, and docs. Instant trust signal to users, VCs, and exchange listing teams.',tag:'Display anywhere'},
            {icon:'⛓️',title:'On-Chain Seal',  desc:'Timestamped certificate, optionally hash-anchored on-chain. Covers exchange listings, grants, and VC due diligence.',tag:'Hash-anchored'},
          ].map(d=>(
            <div key={d.title} style={p.delCard}>
              <span style={{fontSize:'28px',marginBottom:'14px',display:'block'}}>{d.icon}</span>
              <div style={{fontWeight:700,fontSize:'15px',marginBottom:'8px'}}>{d.title}</div>
              <p style={{fontSize:'13px',color:'#7a8a9e',lineHeight:1.6}}>{d.desc}</p>
              <span style={p.tag}>{d.tag}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ADD-ON SERVICES (Smart Contract only) ── */}
      {type === 'smart_contract' && (
        <Section label="Add-On Services" title={<>Enhance Your <span style={{color:'#4fffa4'}}>Audit Coverage</span></>}
          sub="Optional services to strengthen your security posture beyond the core audit.">
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {[
              { icon:'🔀', title:'Fuzzing as a Service',       desc:'Automated property-based fuzzing using Echidna and Medusa. Uncovers edge-case vulnerabilities and unexpected state transitions that manual review can miss.', badge:'Add-on · Quote on request', cta:true },
              { icon:'🛠️', title:'Development Issues Review',  desc:'A thorough review of your development practices, code quality, test coverage, and CI/CD pipeline. We identify gaps in your SDLC that could introduce vulnerabilities post-audit.', badge:'Service · Included on request', cta:false },
              { icon:'📜', title:'Deployment Script Testing',  desc:'Review and testing of your deployment scripts, migration logic, and initialisation flows. Ensures your contracts deploy correctly and securely in production with no misconfigured state.', badge:'Add-on · Quote on request', cta:true },
            ].map(item=>(
              <div key={item.title} style={{background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'24px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'20px',flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:'260px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'22px'}}>{item.icon}</span>
                    <span style={{fontWeight:700,fontSize:'15px'}}>{item.title}</span>
                    <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontFamily:'monospace',background:item.cta?'rgba(245,197,66,0.08)':'rgba(79,255,164,0.08)',color:item.cta?'#f5c542':'#4fffa4',border:item.cta?'1px solid rgba(245,197,66,0.2)':'1px solid rgba(79,255,164,0.15)',whiteSpace:'nowrap'}}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{fontSize:'13px',color:'#7a8a9e',lineHeight:1.65,maxWidth:'560px'}}>{item.desc}</p>
                </div>
                {item.cta && (
                  <a href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer"
                    style={{background:'transparent',border:'1px solid rgba(79,255,164,0.3)',color:'#4fffa4',padding:'9px 18px',borderRadius:'8px',fontSize:'13px',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap',alignSelf:'center'}}>
                    Get a Quote →
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── VULNERABILITY COVERAGE ── */}
      {showVulnSection && (
        <Section
          label="Vulnerability Coverage"
          title={<>{vulnData ? vulnData.title : <><span style={{color:'#4fffa4'}}>Custom</span> Vulnerability Coverage</>}</>}
          sub="Every category we assess — with the specific checkpoints our auditors verify for each.">

          {/* Auto table for Smart Contract or Web App */}
          {vulnData && (
            <div style={{border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',overflow:'auto',background:'#0d1120'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
                <thead>
                  <tr>
                    <th style={p.vulnTh}>VULNERABILITY</th>
                    <th style={p.vulnTh}>{vulnData.colLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnData.rows.map((row, i) => (
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <td style={{...p.vulnTd, fontWeight:700, width:'36%', verticalAlign:'top'}}>{row.vuln}</td>
                      <td style={{...p.vulnTd, verticalAlign:'top'}}>
                        <ul style={{margin:0, paddingLeft:'18px'}}>
                          {row.checks.map((c,j) => (
                            <li key={j} style={{fontSize:'13px',color:'#7a8a9e',lineHeight:1.7,marginBottom:'2px'}}>{c}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Custom rows for Mobile / Traditional */}
          {!vulnData && customVulnRows.length > 0 && (
            <div style={{border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',overflow:'auto',background:'#0d1120'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
                <thead>
                  <tr>
                    <th style={p.vulnTh}>CATEGORY</th>
                    <th style={p.vulnTh}>CHECKPOINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {customVulnRows.map((row, i) => (
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <td style={{...p.vulnTd, fontWeight:700, width:'36%', verticalAlign:'top'}}>{row.category}</td>
                      <td style={{...p.vulnTd, verticalAlign:'top'}}>
                        <ul style={{margin:0, paddingLeft:'18px'}}>
                          {(row.checks||[]).map((c,j) => (
                            <li key={j} style={{fontSize:'13px',color:'#7a8a9e',lineHeight:1.7,marginBottom:'2px'}}>{c}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {/* ── SOCIAL PROOF ── */}
      <Section label="Social Proof" title={<>Trusted by <span style={{color:'#4fffa4'}}>200+ Protocols</span></>}
        sub="We don't just say we're good. Here's the track record.">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',overflow:'hidden',marginBottom:'32px'}}>
          {[
            {num:'2.5M+',label:'Scans on SolidityScan'},
            {num:'200+', label:'Global clients across DeFi, NFT & RWA'},
            {num:'80+',  label:'Blockchain platforms integrated'},
          ].map(s=>(
            <div key={s.label} style={{background:'#0d1120',padding:'28px 24px',textAlign:'center'}}>
              <span style={{display:'block',fontFamily:'monospace',fontSize:'30px',fontWeight:700,color:'#4fffa4',marginBottom:'6px'}}>{s.num}</span>
              <span style={{fontSize:'12px',color:'#7a8a9e',lineHeight:1.4}}>{s.label}</span>
            </div>
          ))}
        </div>
        {[
          {quote:'CredShields found a critical reentrancy vulnerability in our staking contract 48 hours before our mainnet launch. We would have lost everything. The team was sharp and actually understood our protocol architecture not just running a script.',author:'Marcus K.',role:'CTO, DeFi Lending Protocol'},
          {quote:'The audit report was the first thing our lead investor asked for in due diligence. Having the CredShields badge and the on-chain seal reference in our data room closed that conversation immediately.',author:'Sarah L.',role:'Founder, RWA Tokenization Protocol'},
        ].map(t=>(
          <div key={t.author} style={p.testimonial}>
            <p style={{fontSize:'15px',lineHeight:1.7,fontStyle:'italic',color:'#e8edf5'}}>&ldquo;{t.quote}&rdquo;</p>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'16px'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#4fffa4,#0d9e60)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color:'#080b12',flexShrink:0}}>
                {t.author.split(' ').map(w=>w[0]).join('')}
              </div>
              <div>
                <div style={{fontSize:'13px',fontWeight:600}}>{t.author}</div>
                <div style={{fontSize:'12px',color:'#7a8a9e'}}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* ── PAST AUDITS ── */}
      <Section label="Track Record" title={<>Selected <span style={{color:'#4fffa4'}}>Past Audits</span></>}
        sub="We've protected protocols from pre-launch to post-listing across every major vertical.">
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {[
            {name:'Tribally Gaming Protocol',  tag:'Gaming / NFT', tagStyle:p.tagNft,  finding:'2 Critical, 4 High bugs found'},
            {name:'DeFi Lending Protocol',     tag:'DeFi',         tagStyle:p.tagDefi, finding:'1 Critical reentrancy pre-launch'},
            {name:'RWA Tokenization Platform', tag:'RWA',          tagStyle:p.tagRwa,  finding:'3 High oracle manipulation vectors'},
            {name:'Staking & Rewards Protocol',tag:'Staking',      tagStyle:p.tagStake,finding:'Flash loan + access control fixes'},
          ].map(a=>(
            <div key={a.name} style={p.auditRow}>
              <div>
                <div style={{fontWeight:600,fontSize:'14px',marginBottom:'6px'}}>{a.name}</div>
                <span style={{...p.auditTag,...a.tagStyle}}>{a.tag}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'24px',flexWrap:'wrap'}}>
                <span style={{fontSize:'12px',color:'#7a8a9e'}}>{a.finding}</span>
                <a href="https://credshields.com/recently-audited?tab-name=recent" target="_blank" rel="noreferrer"
                  style={{fontSize:'12px',color:'#4fffa4',fontFamily:'monospace',textDecoration:'none'}}>View Report →</a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── METHODOLOGY ── */}
      <Section label="Methodology" title={<>How We <span style={{color:'#4fffa4'}}>Find What Others Miss</span></>}
        sub="AI speed. Human depth. Zero false positives.">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'24px'}}>
          {config.methodology.map(m=>(
            <div key={m.title} style={p.methodCard}>
              <div style={{fontWeight:700,fontSize:'15px',marginBottom:'10px'}}>{m.icon} {m.title}</div>
              <p style={{fontSize:'13px',color:'#7a8a9e',lineHeight:1.65}}>{m.desc}</p>
            </div>
          ))}
        </div>
        <div style={p.coverageBar}>{config.coverage}</div>
      </Section>

      {/* ── COMPARISON ── */}
      <Section label="Why CredShields" title={<>How We Compare to <span style={{color:'#4fffa4'}}>Other Auditors</span></>}
        sub="You're comparing. We want you to.">
        <div style={{border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',overflow:'auto',background:'#0d1120'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
            <thead>
              <tr>
                {['','CredShields ✦',...compRows.map(c=>c.name)].map((h,i)=>(
                  <th key={h} style={{padding:'14px 20px',textAlign:'left',fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:i===1?'#4fffa4':'#7a8a9e',borderBottom:'1px solid rgba(255,255,255,0.07)',whiteSpace:'nowrap',fontFamily:'monospace'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {label:'Price',          us:`$${fmt(proposal.final_price)}`, vals: compRows.map(c=>c.price)},
                {label:'Turnaround',     us:`${proposal.days} days`,         vals: compRows.map(c=>c.days)},
                {label:'Free retest',    us:'✓ 3 months',                    vals: compRows.map(c=>c.retest)},
                {label:'On-chain seal',  us:'✓ Included',                    vals: compRows.map(c=>c.seal)},
                {label:'OWASP mapped',   us:'✓ Co-authored',                 vals: compRows.map(c=>c.owasp)},
                {label:'Direct support', us:'✓ Telegram',                    vals: compRows.map(c=>c.support)},
              ].map(row=>(
                <tr key={row.label} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td style={{padding:'14px 20px',fontSize:'13px',color:'#7a8a9e'}}>{row.label}</td>
                  <td style={{padding:'14px 20px',fontSize:'13px',background:'rgba(79,255,164,0.03)',color:row.us.startsWith('$')||row.us.startsWith('✓')?'#4fffa4':'#e8edf5',fontWeight:row.us.startsWith('$')?700:400,fontFamily:row.us.startsWith('$')?'monospace':'inherit'}}>{row.us}</td>
                  {row.vals.map((v,i)=>(
                    <td key={i} style={{padding:'14px 20px',fontSize:'13px',color:v==='✗'?'#ff4f6a':'#7a8a9e'}}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── PARTNERS ── */}
      {/* ── PARTNERS ── */}
      <Section label="Partners & Integrations" title={<>Trusted Across the <span style={{color:'#4fffa4'}}>Ecosystem</span></>}
        sub="Powered by SolidityScan — 2.5M+ scans completed, integrated across 80+ blockchain platforms.">
        <style>{`.logo-wrap svg { width:100% !important; height:auto !important; max-height:38px; }`}</style>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4,1fr)',
          gap:'12px',
        }}>
          {PARTNER_LOGOS.map(partner=>(
            <div
              key={partner.name}
              style={{
                background:'#0d1120',
                border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:'10px',
                padding:'20px 16px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                minHeight:'72px',
              }}
            >
             <div
                className="logo-wrap"
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  width:'100%',
                  padding:'0 8px',
                }}
                dangerouslySetInnerHTML={{ __html: partner.svg }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <div style={{padding:'100px 0',textAlign:'center',background:'#080b12'}}>
        <div style={p.wrap}>
          <div style={p.scarcityBar}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={p.greenDot} />
              <div>
                <div style={{fontSize:'14px',fontWeight:600}}>{month} {year} availability — 2 slots remaining</div>
                <div style={{fontSize:'12px',color:'#7a8a9e'}}>We limit audits per month to maintain quality. Slot secured with 50% deposit.</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              {[1,2,3].map(i=><div key={i} style={{width:'28px',height:'28px',borderRadius:'4px',background:'rgba(255,79,106,0.3)',border:'1px solid rgba(255,79,106,0.4)'}}/>)}
              {[4,5].map(i=><div key={i} style={{width:'28px',height:'28px',borderRadius:'4px',background:'rgba(79,255,164,0.2)',border:'1px solid rgba(79,255,164,0.4)'}}/>)}
            </div>
          </div>
          <h2 style={{fontWeight:800,fontSize:'clamp(28px,5vw,44px)',lineHeight:1.15,marginBottom:'16px'}}>
            Your security. Your users.<br/><span style={{color:'#4fffa4'}}>Your reputation.</span>
          </h2>
          <p style={{fontSize:'17px',color:'#7a8a9e',marginBottom:'40px',maxWidth:'500px',fontWeight:300,lineHeight:1.7,margin:'0 auto 40px',textAlign:'center'}}>
            Don't ship unaudited. One exploited vulnerability undoes everything you've built, the community, the trust, the TVL.
          </p>
          <a href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer"
            style={{display:'inline-block',background:'linear-gradient(135deg,#4fffa4,#2de88a)',color:'#080b12',fontWeight:800,fontSize:'16px',padding:'16px 40px',borderRadius:'8px',letterSpacing:'0.01em',textDecoration:'none'}}>
            → Book Your Audit Slot Now
          </a>
          <p style={{marginTop:'20px',fontSize:'13px',color:'#7a8a9e'}}>
            Or DM directly on Telegram: <strong style={{color:'#e8edf5'}}>@cred_shields</strong>, we respond within 2 hours.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={p.wrap}>
        <footer style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px',padding:'32px 0',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          <CredShieldsLogo height={34} />
          <p style={{fontSize:'12px',color:'#7a8a9e'}}>20A Tanjong Pagar Road, Singapore — 088443</p>
          <a href="https://credshields.com" target="_blank" rel="noreferrer" style={{fontSize:'12px',color:'#7a8a9e',textDecoration:'underline'}}>credshields.com</a>
        </footer>
      </div>
    </div>
  )
}

function Section({ label, title, sub, children }) {
  return (
    <section style={{padding:'80px 0',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
      <div style={p.wrap}>
        <div style={{fontSize:'11px',letterSpacing:'0.2em',textTransform:'uppercase',color:'#4fffa4',marginBottom:'12px',fontFamily:'monospace'}}>{label}</div>
        <h2 style={{fontWeight:800,fontSize:'clamp(26px,4vw,38px)',letterSpacing:'-0.01em',marginBottom:'16px',lineHeight:1.15}}>{title}</h2>
        {sub && <p style={{fontSize:'16px',color:'#7a8a9e',maxWidth:'580px',marginBottom:'40px',fontWeight:300,lineHeight:1.8}}>{sub}</p>}
        {children}
      </div>
    </section>
  )
}

const p = {
  page:         {background:'#080b12',color:'#e8edf5',fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
  wrap:         {maxWidth:'860px',margin:'0 auto',padding:'0 32px'},
  cover:        {minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',position:'relative',overflow:'hidden',padding:'80px 0',borderBottom:'1px solid rgba(255,255,255,0.07)'},
  coverBg:      {position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(79,255,164,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(45,232,138,0.04) 0%, transparent 60%)',pointerEvents:'none'},
  coverGrid:    {position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(79,255,164,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,255,164,0.03) 1px, transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'},
  logoLine:     {marginBottom:'60px'},
  eyebrow:      {fontSize:'12px',letterSpacing:'0.2em',color:'#4fffa4',textTransform:'uppercase',marginBottom:'20px',fontFamily:'monospace'},
  coverTitle:   {fontWeight:800,fontSize:'clamp(42px,8vw,72px)',lineHeight:1.05,letterSpacing:'-0.02em',marginBottom:'24px'},
  coverSub:     {fontSize:'17px',color:'#7a8a9e',maxWidth:'500px',marginBottom:'48px',fontWeight:300,lineHeight:1.7},
  coverMeta:    {display:'flex',gap:'40px',flexWrap:'wrap'},
  metaLabel:    {fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7a8a9e',marginBottom:'4px',fontFamily:'monospace'},
  metaValue:    {fontSize:'15px',fontWeight:500},
  coverBadge:   {marginTop:'40px',display:'inline-flex',alignItems:'center',gap:'10px',border:'1px solid rgba(79,255,164,0.15)',background:'rgba(79,255,164,0.04)',padding:'10px 18px',borderRadius:'6px',fontSize:'13px',color:'#7a8a9e'},
  redDot:       {width:'8px',height:'8px',borderRadius:'50%',background:'#ff4f6a',display:'inline-block',flexShrink:0},
  greenDot:     {width:'10px',height:'10px',borderRadius:'50%',background:'#4fffa4',display:'inline-block',flexShrink:0},
  urgencyBar:   {background:'linear-gradient(90deg,rgba(255,79,106,0.1),rgba(255,79,106,0.05))',border:'1px solid rgba(255,79,106,0.25)',borderRadius:'8px',padding:'16px 24px',marginBottom:'28px',display:'flex',alignItems:'center',gap:'16px'},
  priceCard:    {border:'1px solid rgba(79,255,164,0.15)',borderRadius:'12px',overflow:'hidden',background:'#0d1120'},
  priceCardHead:{padding:'20px 28px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'},
  discBadgeLg:  {background:'rgba(79,255,164,0.1)',border:'1px solid rgba(79,255,164,0.15)',color:'#4fffa4',padding:'4px 12px',borderRadius:'20px',fontSize:'11px',fontFamily:'monospace'},
  priceTd:      {padding:'16px 28px',fontSize:'14px'},
  priceFooter:  {padding:'16px 28px',borderTop:'1px solid rgba(255,255,255,0.07)',background:'rgba(255,255,255,0.02)',display:'flex',gap:'20px',flexWrap:'wrap'},
  priceFooterItem:{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#7a8a9e'},
  delCard:      {background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'24px'},
  tag:          {marginTop:'14px',display:'inline-block',background:'rgba(79,255,164,0.08)',border:'1px solid rgba(79,255,164,0.15)',color:'#4fffa4',fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontFamily:'monospace'},
  testimonial:  {background:'#0d1120',borderLeft:'3px solid #4fffa4',borderRadius:'0 10px 10px 0',padding:'24px 28px',marginBottom:'20px'},
  auditRow:     {background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'8px',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'},
  auditTag:     {fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontFamily:'monospace'},
  tagDefi:      {background:'rgba(79,130,255,0.12)',color:'#7faeff',border:'1px solid rgba(79,130,255,0.2)'},
  tagNft:       {background:'rgba(200,79,255,0.12)',color:'#d07aff',border:'1px solid rgba(200,79,255,0.2)'},
  tagRwa:       {background:'rgba(255,200,79,0.12)',color:'#ffd07a',border:'1px solid rgba(255,200,79,0.2)'},
  tagStake:     {background:'rgba(79,255,164,0.08)',color:'#4fffa4',border:'1px solid rgba(79,255,164,0.15)'},
  methodCard:   {background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'24px'},
  coverageBar:  {background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'8px',padding:'20px 24px',fontSize:'14px',color:'#7a8a9e',lineHeight:1.8},
  scarcityBar:  {background:'linear-gradient(90deg,rgba(79,255,164,0.07),rgba(79,255,164,0.02))',border:'1px solid rgba(79,255,164,0.15)',borderRadius:'8px',padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px',marginBottom:'40px',textAlign:'left'},
  vulnTh:       {padding:'14px 20px',textAlign:'left',fontSize:'11px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7a8a9e',borderBottom:'1px solid rgba(255,255,255,0.07)',fontFamily:'monospace',background:'rgba(255,255,255,0.02)'},
  vulnTd:       {padding:'18px 20px',fontSize:'14px',borderBottom:'1px solid rgba(255,255,255,0.05)'},
}

const g = {
  overlay:  {position:'fixed',inset:0,background:'rgba(8,11,18,0.92)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:'20px'},
  box:      {background:'#0d1120',border:'1px solid rgba(79,255,164,0.2)',borderRadius:'16px',padding:'48px 40px',width:'100%',maxWidth:'440px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'16px'},
  icon:     {fontSize:'36px'},
  title:    {fontSize:'24px',fontWeight:800,color:'#e8edf5',lineHeight:1.2},
  sub:      {fontSize:'15px',color:'#7a8a9e',lineHeight:1.7,maxWidth:'340px'},
  input:    {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'10px',padding:'14px 18px',color:'#e8edf5',fontSize:'15px',width:'100%',outline:'none',textAlign:'center'},
  btn:      {background:'linear-gradient(135deg,#4fffa4,#2de88a)',color:'#080b12',border:'none',padding:'14px 32px',borderRadius:'8px',fontWeight:800,fontSize:'16px',cursor:'pointer',width:'100%'},
  error:    {color:'#ff4f6a',fontSize:'13px',marginTop:'-8px'},
  privacy:  {fontSize:'12px',color:'#7a8a9e',marginTop:'-4px'},
}
