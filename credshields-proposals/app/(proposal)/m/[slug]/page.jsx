import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PROPOSAL_TYPES } from '../../../../lib/proposalTypes'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export default async function MultichainProposalPage({ params }) {
  const { slug } = await params

  const { data: proposal, error } = await db()
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !proposal) notFound()

  const config = PROPOSAL_TYPES.multichain || PROPOSAL_TYPES.smart_contract
  const fmt = n => Number(n).toLocaleString()

  let timeline = config.methodology || []
  if (proposal.custom_timeline) { try { timeline = JSON.parse(proposal.custom_timeline) } catch (e) {} }

  const vulnRows = config.vulnerabilities || []
  const compRows = config.competitors(proposal.final_price).filter(c => !c.highlight)

  const disc = proposal.original_price > proposal.final_price
    ? Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100)
    : 0

  // Parse extra fields for chains in scope
  let ef = {}
  if (proposal.extra_fields) {
    try { ef = typeof proposal.extra_fields === 'string' ? JSON.parse(proposal.extra_fields) : proposal.extra_fields } catch (e) {}
  }
  const chainsInScope = ef.chainsInScope || ''

  return (
    <>
      <title>{`${proposal.company} | Multi-Chain Deployment Audit`}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: #080b12;
          --card: #0d1120;
          --green: #4fffa4;
          --red: #ff4f6a;
          --white: #e8edf5;
          --muted: #7a8a9e;
          --border: rgba(255,255,255,0.07);
        }

        body {
          background: var(--bg);
          color: var(--white);
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body { background: #080b12 !important; }
          .no-print { display: none !important; }
          .page-break { break-before: page; page-break-before: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .cover { break-after: page; page-break-after: always; }
          h2, .section-label { break-after: avoid; page-break-after: avoid; }
          .ov-card, .del-card, .tl-row, .price-card, .vuln-table tr, .comp-table tr,
          .testimonial, .audit-row { break-inside: avoid; page-break-inside: avoid; }
          @page { size: A4; margin: 10mm 0; }
        }

        .wrap { max-width: 860px; margin: 0 auto; padding: 0 48px; }

        /* COVER */
        .cover {
          min-height: 100vh; display: flex; flex-direction: column;
          justify-content: center; padding: 80px 0;
          border-bottom: 1px solid var(--border); position: relative;
          background: radial-gradient(ellipse 60% 50% at 80% 30%, rgba(79,255,164,0.06) 0%, transparent 70%);
        }
        .eyebrow { font-size: 11px; letter-spacing: 0.2em; color: var(--green); text-transform: uppercase; margin-bottom: 20px; font-family: 'IBM Plex Mono', monospace; }
        .cover-title { font-size: 64px; font-weight: 800; line-height: 1.0; letter-spacing: -0.02em; margin-bottom: 24px; }
        .cover-title .accent { color: var(--green); }
        .cover-sub { font-size: 16px; color: var(--muted); max-width: 460px; margin-bottom: 48px; font-weight: 300; line-height: 1.7; }
        .cover-meta { display: flex; gap: 40px; flex-wrap: wrap; margin-bottom: 32px; }
        .meta-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; font-family: 'IBM Plex Mono', monospace; }
        .meta-value { font-size: 14px; font-weight: 600; }
        .meta-green { font-size: 14px; font-weight: 700; color: var(--green); font-family: 'IBM Plex Mono', monospace; }
        .cover-badge { display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(79,255,164,0.15); background: rgba(79,255,164,0.04); padding: 10px 18px; border-radius: 6px; font-size: 12px; color: var(--muted); }
        .red-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); display: inline-block; flex-shrink: 0; }

        /* SECTIONS */
        .section { padding: 64px 0; border-bottom: 1px solid var(--border); }
        .section-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; font-family: 'IBM Plex Mono', monospace; }
        .section-title { font-size: 32px; font-weight: 800; line-height: 1.15; margin-bottom: 14px; }
        .section-sub { font-size: 14px; color: var(--muted); max-width: 540px; margin-bottom: 32px; font-weight: 300; line-height: 1.8; }
        .accent { color: var(--green); }

        /* URGENCY */
        .urgency { display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, rgba(255,79,106,0.08), rgba(255,79,106,0.04)); border: 1px solid rgba(255,79,106,0.2); border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; font-size: 13px; color: #ffb3be; }

        /* OVERVIEW CARDS */
        .ov-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .ov-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .ov-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
        .ov-icon { font-size: 24px; margin-bottom: 10px; display: block; }
        .ov-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
        .ov-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }

        /* PRICE CARD */
        .price-card { border: 1px solid rgba(79,255,164,0.15); border-radius: 12px; overflow: hidden; background: var(--card); margin-bottom: 16px; }
        .price-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); }
        .price-head-txt { font-weight: 700; font-size: 14px; }
        .disc-badge { font-size: 10px; color: var(--green); background: rgba(79,255,164,0.08); border: 1px solid rgba(79,255,164,0.15); padding: 3px 10px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
        .price-row { display: flex; justify-content: space-between; padding: 11px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
        .price-label { color: var(--muted); }
        .price-strike { text-decoration: line-through; color: var(--muted); }
        .price-final { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; background: rgba(79,255,164,0.04); }
        .price-final-label { font-size: 16px; font-weight: 700; }
        .price-final-val { font-size: 20px; font-weight: 700; color: var(--green); font-family: 'IBM Plex Mono', monospace; }
        .price-footer { display: flex; flex-wrap: wrap; gap: 16px; padding: 12px 24px; background: rgba(255,255,255,0.02); border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); }
        .price-footer span::before { content: '\\2713 '; color: var(--green); }

        /* TIMELINE */
        .tl-row { display: grid; grid-template-columns: 80px 1fr; gap: 0 20px; margin-bottom: 24px; }
        .tl-day { font-size: 10px; color: var(--green); font-family: 'IBM Plex Mono', monospace; text-align: right; padding-right: 20px; padding-top: 3px; }
        .tl-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .tl-desc { font-size: 12px; color: var(--muted); line-height: 1.65; }

        /* DELIVERABLES */
        .del-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .del-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
        .del-icon { font-size: 24px; margin-bottom: 10px; display: block; }
        .del-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
        .del-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }
        .del-tag { margin-top: 10px; display: inline-block; background: rgba(79,255,164,0.08); border: 1px solid rgba(79,255,164,0.15); color: var(--green); font-size: 10px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }

        /* VULN TABLE */
        .vuln-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        .vuln-th { padding: 10px 16px; text-align: left; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); font-family: 'IBM Plex Mono', monospace; }
        .vuln-td { padding: 12px 16px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
        .vuln-td ul { margin: 0; padding-left: 16px; }
        .vuln-td li { font-size: 11px; color: var(--muted); line-height: 1.7; }

        /* STATS */
        .stats-row { display: grid; grid-template-columns: repeat(3,1fr); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
        .stat-box { background: var(--card); padding: 24px; text-align: center; }
        .stat-num { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 26px; font-weight: 700; color: var(--green); margin-bottom: 4px; }
        .stat-lbl { font-size: 11px; color: var(--muted); }

        /* COMPARISON */
        .comp-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .comp-th { padding: 12px 16px; text-align: left; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; }
        .comp-th-us { padding: 12px 16px; text-align: left; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); border-bottom: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; }
        .comp-td { padding: 12px 16px; font-size: 12px; color: var(--muted); border-bottom: 1px solid rgba(255,255,255,0.04); }
        .comp-td-us { padding: 12px 16px; font-size: 12px; color: var(--green); background: rgba(79,255,164,0.03); border-bottom: 1px solid rgba(255,255,255,0.04); }
        .comp-td-bad { padding: 12px 16px; font-size: 12px; color: var(--red); border-bottom: 1px solid rgba(255,255,255,0.04); }

        /* CTA */
        .cta { padding: 80px 0 64px; text-align: center; }
        .cta-title { font-size: 36px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
        .cta-sub { font-size: 15px; color: var(--muted); max-width: 460px; margin: 0 auto 32px; font-weight: 300; line-height: 1.7; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg,#4fffa4,#2de88a); color: #080b12; font-weight: 800; font-size: 15px; padding: 14px 36px; border-radius: 8px; text-decoration: none; }
        .cta-tg { margin-top: 16px; font-size: 12px; color: var(--muted); }

        /* AUDIT ROWS */
        .audit-row { display: flex; justify-content: space-between; align-items: center; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 20px; margin-bottom: 8px; }
        .audit-name { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
        .audit-tag { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
        .audit-finding { font-size: 12px; color: var(--muted); }
        .tag-defi  { background: rgba(79,130,255,0.12); color: #7faeff; border: 1px solid rgba(79,130,255,0.2); }
        .tag-nft   { background: rgba(200,79,255,0.12); color: #d07aff; border: 1px solid rgba(200,79,255,0.2); }
        .tag-rwa   { background: rgba(255,200,79,0.12); color: #ffd07a; border: 1px solid rgba(255,200,79,0.2); }
        .tag-stake { background: rgba(79,255,164,0.08); color: #4fffa4; border: 1px solid rgba(79,255,164,0.15); }
        .tag-bridge { background: rgba(79,200,255,0.12); color: #7ad4ff; border: 1px solid rgba(79,200,255,0.2); }

        /* FOOTER */
        footer { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; border-top: 1px solid var(--border); font-size: 11px; color: var(--muted); }
        footer a { color: var(--muted); }
      ` }} />

      {/* Print button */}
      <script dangerouslySetInnerHTML={{ __html: `
        var btn = document.createElement('button');
        btn.className = 'no-print';
        btn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:linear-gradient(135deg,#4fffa4,#2de88a);color:#080b12;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;font-family:monospace;box-shadow:0 4px 20px rgba(79,255,164,0.3)';
        btn.textContent = '\\u2B07 Download PDF';
        btn.onclick = function() { window.print(); };
        document.body.prepend(btn);
      ` }} />

      {/* -- COVER -- */}
      <div className="cover">
        <div className="wrap">
          <div style={{ marginBottom: 24 }}>
            <img src="/credshields-logo-white.png" alt="CredShields" style={{ height: 60 }} />
          </div>
          <div className="eyebrow">Multi-Chain Deployment Audit</div>
          <h1 className="cover-title">
            Multi-Chain Deployment<br /><span className="accent">Security Audit</span>
          </h1>
          <p className="cover-sub">
            {`Prepared exclusively for ${proposal.client_name} at ${proposal.company}. Comprehensive cross-chain security analysis covering compiler divergence, bridge trust, state synchronisation, and chain-specific risk vectors.`}
          </p>
          <div className="cover-meta">
            <div><div className="meta-label">Prepared by</div><div className="meta-value">CredShields Technologies Pte. Ltd.</div></div>
            <div><div className="meta-label">Scope</div><div className="meta-value">{proposal.company}</div></div>
            {chainsInScope && <div><div className="meta-label">Chains in Scope</div><div className="meta-value">{chainsInScope}</div></div>}
            <div><div className="meta-label">Engagement Price</div><div className="meta-green">${fmt(proposal.final_price)} USD</div></div>
          </div>
          <div className="cover-badge">
            <span className="red-dot" />
            Limited multi-chain audit slots available. One unchecked chain can compromise all others
          </div>
        </div>
      </div>

      {/* -- OVERVIEW -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">01 Overview</div>
          <h2 className="section-title">Why multi-chain security<br /><span className="accent">demands a dedicated audit.</span></h2>
          <p className="section-sub">{"Deploying a protocol across multiple chains is not just replication. It introduces an entirely new class of vulnerabilities at every point of divergence: compiler behaviour, gas models, bridging trust, state synchronisation, and finality assumptions. One unchecked chain can drain them all."}</p>
          <div className="ov-grid-3">
            {[
              { icon: '\uD83D\uDD17', title: 'Cross-Chain Logic',       desc: 'Message integrity, replay protection, and encoding consistency across LayerZero, CCIP, and native bridges.' },
              { icon: '\u26FD',       title: 'Gas and Fee Divergence',  desc: 'L2 calldata/blob differences, dynamic pricing behaviour, and refund mechanisms verified per chain.' },
              { icon: '\uD83D\uDD04', title: 'State Consistency',       desc: 'Governance, timestamps, and sync lag tolerance tested across all deployed chain environments.' },
              { icon: '\uD83D\uDEE1', title: 'Bridge and Relayer Trust',desc: 'Decentralisation checks, fallback handling, and token lock/mint parity for every bridge dependency.' },
              { icon: '\uD83D\uDD11', title: 'Admin Portability',       desc: 'Multi-sig/timelock parity, role consistency, and emergency pause propagation across all chains.' },
              { icon: '\uD83C\uDF2A', title: 'Chaos Testing',           desc: 'Full cross-chain lifecycle testing with bridge downtime simulations and multi-chain invariant fuzzing.' },
            ].map(c => (
              <div key={c.title} className="ov-card avoid-break">
                <span className="ov-icon">{c.icon}</span>
                <div className="ov-title">{c.title}</div>
                <div className="ov-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -- VULNERABILITY COVERAGE -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">02 Vulnerability Coverage</div>
          <h2 className="section-title">{vulnRows.length} Vulnerability Categories. <span className="accent">36+ Checkpoints</span></h2>
          <p className="section-sub">Every category below is assessed against three or more specific checkpoints, each mapped to real-world exploit patterns observed in production multi-chain deployments.</p>
          <table className="vuln-table">
            <thead><tr><th className="vuln-th">Vulnerability</th><th className="vuln-th">Checkpoints</th></tr></thead>
            <tbody>
              {vulnRows.map((row, i) => (
                <tr key={i} className="avoid-break">
                  <td className="vuln-td" style={{ fontWeight: 700, width: '36%' }}>{row.vuln}</td>
                  <td className="vuln-td"><ul>{row.checks.map((c, j) => <li key={j}>{c}</li>)}</ul></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -- PRICING -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">03 Scope and Pricing</div>
          <h2 className="section-title">Engagement <span className="accent">Investment</span></h2>
          <p className="section-sub">All deliverables included. 50% to start, 50% after delivery.</p>
          <div className="urgency">
            <span>{'\u26A0\uFE0F'}</span>
            <span><strong style={{ color: '#ff4f6a' }}>One unchecked chain can compromise all others.</strong> A multi-chain audit at this stage is the highest-ROI security investment your protocol will make.</span>
          </div>
          <div className="price-card avoid-break">
            <div className="price-head">
              <span className="price-head-txt">{proposal.company} | Multi-Chain Deployment Audit</span>
              {disc > 0 && <span className="disc-badge">{disc}% DISCOUNT APPLIED</span>}
            </div>
            {[
              ['Client', proposal.client_name],
              ...(chainsInScope ? [['Chains in Scope', chainsInScope]] : []),
              ...(proposal.loc ? [['Lines of Code', fmt(proposal.loc)]] : []),
              ['Duration', `${proposal.days} Business Days`],
              ...(disc > 0 ? [['Standard Price', null, `$${fmt(proposal.original_price)} USD`]] : []),
            ].map(([label, val, strike]) => (
              <div key={label} className="price-row">
                <span className="price-label">{label}</span>
                {strike ? <span className="price-strike">{strike}</span> : <span>{val}</span>}
              </div>
            ))}
            <div className="price-final">
              <span className="price-final-label">Engagement Price</span>
              <span className="price-final-val">${fmt(proposal.final_price)} USD</span>
            </div>
            <div className="price-footer">
              {['50% upfront, 50% on delivery', 'USDC / Fiat accepted', 'NDA protected', 'Free retest window'].map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* -- METHODOLOGY -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">04 Methodology</div>
          <h2 className="section-title">Done in <span className="accent">{proposal.days} Days</span></h2>
          <p className="section-sub">Our multi-chain audit methodology is structured around the actual attack paths adversaries use. Every phase produces actionable findings with chain-specific remediation guidance.</p>
          {timeline.map((item, i) => (
            <div key={i} className="tl-row avoid-break">
              <div className="tl-day">{item.day || item.duration || item.step}</div>
              <div>
                <div className="tl-title">{item.title}</div>
                <div className="tl-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -- DELIVERABLES -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">05 Deliverables</div>
          <h2 className="section-title">What You <span className="accent">Walk Away With</span></h2>
          <p className="section-sub">Six compounding credibility assets, not just a PDF.</p>
          <div className="del-grid">
            {[
              { icon: '\uD83D\uDCCB', title: 'Executive Summary',       desc: 'Board-ready risk narrative with strategic recommendations. Zero technical jargon.', tag: 'Leadership-ready' },
              { icon: '\uD83D\uDD2C', title: 'Full Technical Report',   desc: 'Chain-by-chain exploit chains, CVSS scoring, PoC evidence, and fix guidance.', tag: 'Engineer-ready' },
              { icon: '\uD83D\uDDFA', title: 'Remediation Roadmap',     desc: 'Prioritised fix plan with effort/impact scoring and a 30/60/90-day schedule.', tag: 'Actionable' },
              { icon: '\uD83C\uDF99', title: 'Live Debrief',            desc: 'Walkthrough session with your engineering team. Full attack replay and Q&A.', tag: 'Interactive' },
              { icon: '\u2705',       title: 'Re-test and Attestation', desc: 'Critical finding re-test post-fix, with signed verification letter.', tag: 'Verified' },
              { icon: '\uD83D\uDD10', title: 'Compliance Docs',         desc: 'Audit-ready outputs compatible with ISO 27001, SOC 2, and chain-specific frameworks.', tag: 'Audit-ready' },
            ].map(d => (
              <div key={d.title} className="del-card avoid-break">
                <span className="del-icon">{d.icon}</span>
                <div className="del-title">{d.title}</div>
                <div className="del-desc">{d.desc}</div>
                <span className="del-tag">{d.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -- TRACK RECORD -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">Track Record</div>
          <h2 className="section-title">Selected <span className="accent">Past Audits</span></h2>
          {[
            { name: 'Multi-Chain DeFi Protocol',      tag: 'DeFi / Bridge',  cls: 'tag-bridge', finding: '3 Critical cross-chain replay vulnerabilities found' },
            { name: 'Cross-Chain Lending Protocol',    tag: 'DeFi',           cls: 'tag-defi',   finding: '2 Critical bridge trust assumption flaws' },
            { name: 'RWA Tokenization Platform',       tag: 'RWA',            cls: 'tag-rwa',    finding: '3 High oracle manipulation vectors across chains' },
            { name: 'Multi-Chain Staking Infrastructure', tag: 'Staking',     cls: 'tag-stake',  finding: 'State sync and admin portability fixes on 4 chains' },
          ].map(a => (
            <div key={a.name} className="audit-row avoid-break">
              <div><div className="audit-name">{a.name}</div><span className={`audit-tag ${a.cls}`}>{a.tag}</span></div>
              <div className="audit-finding">{a.finding}</div>
            </div>
          ))}
        </div>
      </div>

      {/* -- COMPARISON -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">Why CredShields</div>
          <h2 className="section-title">How We <span className="accent">Compare</span></h2>
          <table className="comp-table">
            <thead>
              <tr>
                <th className="comp-th"> </th>
                <th className="comp-th-us">{'CredShields \u2726'}</th>
                {compRows.map(c => <th key={c.name} className="comp-th">{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Price',               us: `$${fmt(proposal.final_price)}`,   vals: compRows.map(c => c.price) },
                { label: 'Turnaround',           us: `${proposal.days} days`,           vals: compRows.map(c => c.turnaround) },
                { label: 'Chain-specific report', us: '\u2713 Included',                vals: compRows.map(() => '\u2717') },
                { label: 'Cross-chain testing',   us: '\u2713 Included',                vals: compRows.map(() => '\u2717') },
                { label: 'Remediation support',   us: '\u2713 Included',                vals: compRows.map(() => '\u2717') },
                { label: 'Direct support',        us: '\u2713 Telegram',                vals: compRows.map(c => c.notes) },
              ].map(row => (
                <tr key={row.label}>
                  <td className="comp-td">{row.label}</td>
                  <td className="comp-td-us">{row.us}</td>
                  {row.vals.map((v, i) => <td key={i} className={v === '\u2717' ? 'comp-td-bad' : 'comp-td'}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -- CTA -- */}
      <div className="cta">
        <div className="wrap">
          <h2 className="cta-title">
            Ready to secure<br /><span className="accent">every chain?</span>
          </h2>
          <p className="cta-sub">
            {"One unchecked deployment can compromise all others. Let's scope your engagement today."}
          </p>
          <a className="cta-btn" href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer">
            {'\u2192'} Book Your Multi-Chain Audit Now
          </a>
          <p className="cta-tg">Or DM on Telegram: <strong style={{ color: '#e8edf5' }}>@cred_shields</strong>. We respond within 2 hours.</p>
        </div>
      </div>

      {/* -- FOOTER -- */}
      <div className="wrap">
        <footer>
          <span>CredShields Technologies Pte. Ltd. · 20A Tanjong Pagar Road, Singapore 088443</span>
          <a href="https://credshields.com">credshields.com</a>
        </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        if (window.location.search.includes('print=1')) {
          window.addEventListener('load', () => {
            setTimeout(() => window.print(), 800);
          });
        }
      ` }} />
    </>
  )
}
