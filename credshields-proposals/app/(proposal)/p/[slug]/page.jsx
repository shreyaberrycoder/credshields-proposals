import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PROPOSAL_TYPES } from '../../../../lib/proposalTypes'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export default async function PdfPage({ params }) {
  const { slug } = await params

  const { data: proposal, error } = await db()
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !proposal) notFound()

  const type   = proposal.proposal_type || 'smart_contract'
  const config = PROPOSAL_TYPES[type] || PROPOSAL_TYPES.smart_contract
  const ef     = proposal.extra_fields
    ? (typeof proposal.extra_fields === 'string' ? JSON.parse(proposal.extra_fields) : proposal.extra_fields)
    : {}

  const disc = proposal.original_price > proposal.final_price
    ? Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100)
    : 0

  let timeline = config.methodology || []
  if (proposal.custom_timeline) { try { timeline = JSON.parse(proposal.custom_timeline) } catch (e) {} }

  const vulnRows = config.vulnerabilities || null
  let customVulns = []
  if (!vulnRows && proposal.custom_vulnerabilities) { try { customVulns = JSON.parse(proposal.custom_vulnerabilities) } catch (e) {} }

  const compRows = config.competitors(proposal.final_price).filter(c => !c.highlight)
  const isRedTeam = type === 'red_team'
  const fmt = n => Number(n).toLocaleString()

  // Optional sections
  const customTextBlock = (placement) => (
    ef.customText && ef.customTextSection === placement ? (
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">Additional Information</div>
          <div style={{ fontSize: 14, color: '#e8edf5', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{ef.customText}</div>
        </div>
      </div>
    ) : null
  )
  const paymentBlock = (placement) => (
    ef.paymentStructure && ef.paymentSection === placement ? (
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">Payment Structure</div>
          <h2 className="section-title">Payment <span className="accent">Terms</span></h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 14, color: '#e8edf5', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{ef.paymentStructure}</div>
          </div>
        </div>
      </div>
    ) : null
  )
  const optionalSections = (placement) => <>{customTextBlock(placement)}{paymentBlock(placement)}</>
  const month = new Date(proposal.created_at).toLocaleString('default', { month: 'long' })
  const year  = new Date(proposal.created_at).getFullYear()

  const activeVectors = isRedTeam
    ? (ef.redTeamVectors || []).map(id => config.redTeamVectors?.find(v => v.id === id)).filter(Boolean)
    : []

  const coverTitles = {
    smart_contract: 'Security Audit Proposal',
    fuzzing:        'Fuzz Testing Proposal',
    multichain:     'Multi-Chain Security Audit',
    web_app:        'Web App Security Audit',
    mobile:         'Mobile App Security Audit',
    traditional:    'Security Assessment Proposal',
    red_team:       'Red Team Engagement',
  }

  return (
    <>
      <title>{`${proposal.company} | CredShields Proposal`}</title>
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

          /* ── PRINT ── */
          @media print {
            body { background: #080b12 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break { break-before: page; page-break-before: always; }
            .avoid-break { break-inside: avoid; page-break-inside: avoid; }
            .cover { break-after: page; page-break-after: always; }
            h2, .section-label { break-after: avoid; page-break-after: avoid; }
            .tl-row, .del-card, .audit-row, .testimonial, .threat-card, .vector-row,
            .price-card, .comp-table tr, .vuln-table tr, .stat-box {
              break-inside: avoid; page-break-inside: avoid;
            }
            @page { size: A4; margin: 10mm 0; }
          }

          /* ── PRINT TRIGGER BUTTON ── */
          .print-btn {
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            background: linear-gradient(135deg, #4fffa4, #2de88a);
            color: #080b12; border: none; padding: 12px 24px;
            border-radius: 8px; font-weight: 700; font-size: 14px;
            cursor: pointer; font-family: monospace;
            box-shadow: 0 4px 20px rgba(79,255,164,0.3);
          }

          /* ── LAYOUT ── */
          .wrap { max-width: 860px; margin: 0 auto; padding: 0 48px; }

          /* ── COVER ── */
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

          /* ── SECTIONS ── */
          .section { padding: 64px 0; border-bottom: 1px solid var(--border); }
          .section-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; font-family: 'IBM Plex Mono', monospace; }
          .section-title { font-size: 32px; font-weight: 800; line-height: 1.15; margin-bottom: 14px; }
          .section-sub { font-size: 14px; color: var(--muted); max-width: 540px; margin-bottom: 32px; font-weight: 300; line-height: 1.8; }
          .accent { color: var(--green); }

          /* ── URGENCY ── */
          .urgency { display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, rgba(255,79,106,0.08), rgba(255,79,106,0.04)); border: 1px solid rgba(255,79,106,0.2); border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; font-size: 13px; color: #ffb3be; }

          /* ── PRICE CARD ── */
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
          .price-footer span::before { content: '✓ '; color: var(--green); }
          .scope-box { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px 20px; margin-top: 16px; }
          .scope-lbl { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px; }

          /* ── TIMELINE ── */
          .tl-row { display: grid; grid-template-columns: 80px 1fr; gap: 0 20px; margin-bottom: 24px; }
          .tl-day { font-size: 10px; color: var(--green); font-family: 'IBM Plex Mono', monospace; text-align: right; padding-right: 20px; padding-top: 3px; }
          .tl-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .tl-desc { font-size: 12px; color: var(--muted); line-height: 1.65; }

          /* ── DELIVERABLES ── */
          .del-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .del-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
          .del-icon { font-size: 24px; margin-bottom: 10px; display: block; }
          .del-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
          .del-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }
          .del-tag { margin-top: 10px; display: inline-block; background: rgba(79,255,164,0.08); border: 1px solid rgba(79,255,164,0.15); color: var(--green); font-size: 10px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }

          /* ── VULN TABLE ── */
          .vuln-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
          .vuln-th { padding: 10px 16px; text-align: left; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); font-family: 'IBM Plex Mono', monospace; }
          .vuln-td { padding: 12px 16px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
          .vuln-td ul { margin: 0; padding-left: 16px; }
          .vuln-td li { font-size: 11px; color: var(--muted); line-height: 1.7; }

          /* ── STATS ── */
          .stats-row { display: grid; grid-template-columns: repeat(3,1fr); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
          .stat-box { background: var(--card); padding: 24px; text-align: center; }
          .stat-num { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 26px; font-weight: 700; color: var(--green); margin-bottom: 4px; }
          .stat-lbl { font-size: 11px; color: var(--muted); }

          /* ── TESTIMONIALS ── */
          .testimonial { background: var(--card); border-left: 3px solid var(--green); border-radius: 0 8px 8px 0; padding: 20px 24px; margin-bottom: 16px; }
          .test-quote { font-size: 13px; line-height: 1.7; font-style: italic; color: var(--white); margin-bottom: 12px; }
          .test-author { font-size: 12px; font-weight: 600; }
          .test-role { font-size: 11px; color: var(--muted); }

          /* ── AUDIT ROWS ── */
          .audit-row { display: flex; justify-content: space-between; align-items: center; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 20px; margin-bottom: 8px; }
          .audit-name { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
          .audit-tag { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
          .audit-finding { font-size: 12px; color: var(--muted); }
          .tag-defi  { background: rgba(79,130,255,0.12); color: #7faeff; border: 1px solid rgba(79,130,255,0.2); }
          .tag-nft   { background: rgba(200,79,255,0.12); color: #d07aff; border: 1px solid rgba(200,79,255,0.2); }
          .tag-rwa   { background: rgba(255,200,79,0.12); color: #ffd07a; border: 1px solid rgba(255,200,79,0.2); }
          .tag-stake { background: rgba(79,255,164,0.08); color: #4fffa4; border: 1px solid rgba(79,255,164,0.15); }

          /* ── COMPARISON ── */
          .comp-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
          .comp-th { padding: 12px 16px; text-align: left; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; }
          .comp-th-us { padding: 12px 16px; text-align: left; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); border-bottom: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; }
          .comp-td { padding: 12px 16px; font-size: 12px; color: var(--muted); border-bottom: 1px solid rgba(255,255,255,0.04); }
          .comp-td-us { padding: 12px 16px; font-size: 12px; color: var(--green); background: rgba(79,255,164,0.03); border-bottom: 1px solid rgba(255,255,255,0.04); }
          .comp-td-bad { padding: 12px 16px; font-size: 12px; color: var(--red); border-bottom: 1px solid rgba(255,255,255,0.04); }

          /* ── RED TEAM VECTORS ── */
          .vector-row { display: grid; grid-template-columns: 48px 1fr; gap: 0 16px; padding: 24px 0; border-bottom: 1px solid var(--border); }
          .vector-num { font-size: 10px; color: var(--green); font-family: 'IBM Plex Mono', monospace; padding-top: 3px; }
          .vector-title { font-weight: 700; font-size: 15px; margin-bottom: 8px; }
          .vector-desc { font-size: 12px; color: var(--muted); line-height: 1.65; margin-bottom: 10px; }
          .vector-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .vector-tag { font-size: 10px; color: var(--green); background: rgba(79,255,164,0.06); border: 1px solid rgba(79,255,164,0.12); padding: 2px 9px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
          .roe-box { margin-top: 16px; background: rgba(255,79,106,0.04); border: 1px solid rgba(255,79,106,0.15); border-radius: 8px; padding: 16px 20px; }
          .roe-lbl { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--red); font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px; }
          .scope-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
          .scope-pill { font-size: 10px; padding: 4px 12px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
          .pill-yes { color: var(--green); background: rgba(79,255,164,0.06); border: 1px solid rgba(79,255,164,0.2); }
          .pill-no  { color: var(--muted); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); }

          /* ── THREAT CARDS ── */
          .threat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
          .threat-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
          .threat-icon { font-size: 22px; margin-bottom: 8px; display: block; }
          .threat-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
          .threat-stat { font-size: 10px; color: var(--green); font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px; }
          .threat-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }

          /* ── CTA ── */
          .cta { padding: 80px 0 64px; text-align: center; }
          .cta-title { font-size: 36px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
          .cta-sub { font-size: 15px; color: var(--muted); max-width: 460px; margin: 0 auto 32px; font-weight: 300; line-height: 1.7; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg,#4fffa4,#2de88a); color: #080b12; font-weight: 800; font-size: 15px; padding: 14px 36px; border-radius: 8px; text-decoration: none; }
          .cta-tg { margin-top: 16px; font-size: 12px; color: var(--muted); }

          /* ── FOOTER ── */
          footer { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; border-top: 1px solid var(--border); font-size: 11px; color: var(--muted); }
          footer a { color: var(--muted); }
        ` }} />

      {/* Print button, injected via client-side script */}
        <script dangerouslySetInnerHTML={{ __html: `
          var btn = document.createElement('button');
          btn.className = 'print-btn no-print';
          btn.textContent = '⬇ Download PDF';
          btn.onclick = function() { window.print(); };
          document.body.prepend(btn);
        ` }} />

        {/* ── COVER ── */}
        <div className="cover">
          <div className="wrap">
            <div style={{ marginBottom: 24 }}>
              <img src="/credshields-logo-white.png" alt="CredShields" style={{ height: 60 }} />
            </div>
            <div className="eyebrow">{config.label}</div>
            <h1 className="cover-title">
              {isRedTeam ? <>Think like<br />the enemy.<br /><span className="accent">Before they do.</span></> :
               type === 'smart_contract' ? <>Security<br />Audit<br /><span className="accent">Proposal</span></> :
               type === 'fuzzing'        ? <>Fuzz Testing<br /><span className="accent">Proposal</span></> :
               type === 'multichain'     ? <>Multi-Chain<br />Security<br /><span className="accent">Audit</span></> :
               type === 'web_app'        ? <>Web App<br />Security<br /><span className="accent">Audit</span></> :
               type === 'mobile'         ? <>Mobile App<br />Security<br /><span className="accent">Audit</span></> :
                                           <>Security<br />Assessment<br /><span className="accent">Proposal</span></>}
            </h1>
            <p className="cover-sub">
              {isRedTeam
                ? `A full-spectrum adversarial engagement designed for ${proposal.company}, before a real attacker finds what your defences missed.`
                : `Prepared exclusively for ${proposal.client_name} at ${proposal.company}.`}
            </p>
            <div className="cover-meta">
              <div><div className="meta-label">Prepared by</div><div className="meta-value">CredShields Technologies Pte. Ltd.</div></div>
              <div><div className="meta-label">Scope</div><div className="meta-value">{proposal.scope_description || proposal.company}</div></div>
              <div><div className="meta-label">Engagement Price</div><div className="meta-green">${fmt(proposal.final_price)} USD</div></div>
              {isRedTeam && ef.threatActorProfile && <div><div className="meta-label">Threat Profile</div><div className="meta-value">{ef.threatActorProfile}</div></div>}
            </div>
            <div className="cover-badge">
              <span className="red-dot" />
              {isRedTeam ? 'Confidential engagement. NDA applies' : `Only 2 audit slots remaining in ${month}. Availability is limited`}
            </div>
          </div>
        </div>

        {optionalSections('after_cover')}

        {/* ── RED TEAM: THREAT LANDSCAPE ── */}
        {isRedTeam && (
          <div className="section page-break">
            <div className="wrap">
              <div className="section-label">01 Why Red Teaming</div>
              <h2 className="section-title">The threat is real. <span className="accent">The question is readiness.</span></h2>
              <p className="section-sub">Traditional security audits find known vulnerabilities. Red teaming finds what attackers actually exploit: the gaps between your controls, your people, your protocols, and your assumptions.</p>
              <div className="threat-grid">
                {[
                  { icon: '⛓️', title: 'On-Chain Protocol Risk',     stat: '$3.6B lost in 2025',  desc: 'Smart contract vulnerabilities, flash loan attacks, oracle manipulation, and governance exploits continue to drain billions.' },
                  { icon: '🎯', title: 'Advanced Persistent Threats', stat: '194 days avg dwell',  desc: 'Nation-state actors conduct multi-month reconnaissance. Standard defences are tested, mapped, and avoided before any attack.' },
                  { icon: '🤖', title: 'AI-Augmented Attacks',        stat: 'New threat class',    desc: 'LLM-powered phishing, deepfake voice cloning, and adversarial prompt injection represent a threat class most teams are unprepared for.' },
                  { icon: '👤', title: 'Human Element',               stat: '82% of breaches',     desc: '82% of breaches involve the human element. From spear-phishing to SIM-swapping key personnel, the weakest link is almost never a firewall.' },
                  { icon: '☁️', title: 'Cloud & Infrastructure',       stat: '$4.8M avg cost',     desc: 'Misconfigured S3 buckets, over-privileged IAM roles, exposed CI/CD pipelines, and shadow IT create invisible attack paths.' },
                  { icon: '🔗', title: 'Supply Chain Exposure',        stat: 'Growing attack vec',  desc: 'Dependency confusion, compromised packages, and vendor access are routinely leveraged for cascading compromise.' },
                ].map(t => (
                  <div key={t.title} className="threat-card avoid-break">
                    <span className="threat-icon">{t.icon}</span>
                    <div className="threat-title">{t.title}</div>
                    <div className="threat-stat">↗ {t.stat}</div>
                    <div className="threat-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        <div className="section page-break">
          <div className="wrap">
            <div className="section-label">{isRedTeam ? '02 Engagement Scope' : 'Scope & Pricing'}</div>
            <h2 className="section-title">{isRedTeam ? <>Engagement <span className="accent">Overview</span></> : <>Your Audit, <span className="accent">Scoped & Priced</span></>}</h2>
            <p className="section-sub">{isRedTeam ? 'Full-spectrum adversarial simulation, scoped around your specific threat model and crown jewels.' : "Everything included. No surprises. 50% to start, 50% after retest."}</p>
            <div className="urgency">
              <span>⚠️</span>
              <span><strong style={{ color: isRedTeam ? '#4fa3ff' : '#ff4f6a' }}>{isRedTeam ? 'Adversaries are already conducting reconnaissance against your organisation.' : '$3.6B+ was lost to exploits in 2025.'}</strong>{' '}{isRedTeam ? "The question is not whether you'll be targeted. It's whether you'll know." : 'An audit at this stage is the highest-ROI security investment your protocol will ever make.'}</span>
            </div>
            <div className="price-card avoid-break">
              <div className="price-head">
                <span className="price-head-txt">{proposal.company} | {config.label}</span>
                {disc > 0 && <span className="disc-badge">{disc}% DISCOUNT APPLIED</span>}
              </div>
              {[
                ['Client', proposal.client_name],
                ...(proposal.loc && !isRedTeam ? [['Lines of Code', fmt(proposal.loc)]] : []),
                ...(ef.chainsInScope ? [['Chains in Scope', ef.chainsInScope]] : []),
                ...(ef.mobilePlatform ? [['Platform', ef.mobilePlatform]] : []),
                ...(ef.appName ? [['Application', ef.appName]] : []),
                ...(ef.appUrls ? [['URL(s)', ef.appUrls]] : []),
                ...(ef.assetsInScope ? [['Assets in Scope', ef.assetsInScope]] : []),
                ...(ef.complianceFramework && ef.complianceFramework !== 'None / Not applicable' ? [['Compliance', ef.complianceFramework]] : []),
                ...(ef.crownJewels ? [['Crown Jewels', ef.crownJewels]] : []),
                ...(ef.threatActorProfile ? [['Threat Profile', ef.threatActorProfile]] : []),
                ['Duration', `${proposal.days} ${isRedTeam ? (proposal.days == 1 ? 'phase' : 'phases') : (proposal.days == 1 ? 'Business Day' : 'Business Days')}`],
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
                {(isRedTeam
                  ? ['50% upfront, 50% on delivery', 'Comprehensive NDA in place', 'All findings under strict confidentiality', 'Remediation support included']
                  : ['50% upfront, 50% before retest', 'USDC / Fiat accepted', 'Free 3-month retest window']
                ).map(t => <span key={t}>{t}</span>)}
              </div>
            </div>
            {proposal.scope_description && (
              <div className="scope-box">
                <div className="scope-lbl">Engagement Scope</div>
                <p>{proposal.scope_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RED TEAM: ATTACK VECTORS ── */}
        {isRedTeam && activeVectors.length > 0 && (
          <div className="section page-break">
            <div className="wrap">
              <div className="section-label">03 Attack Vectors</div>
              <h2 className="section-title">Eight vectors. <span className="accent">One integrated program.</span></h2>
              <p className="section-sub">The following vectors are in scope for this engagement.</p>
              {activeVectors.map(v => (
                <div key={v.id} className="vector-row avoid-break">
                  <div className="vector-num">{v.num}</div>
                  <div>
                    <div className="vector-title">{v.title}</div>
                    <div className="vector-desc">{v.desc}</div>
                    <div className="vector-tags">{v.tags.map(tag => <span key={tag} className="vector-tag">{tag}</span>)}</div>
                  </div>
                </div>
              ))}
              {ef.rulesOfEngagement && (
                <div className="roe-box">
                  <div className="roe-lbl">Rules of Engagement</div>
                  <p>{ef.rulesOfEngagement}</p>
                </div>
              )}
              <div className="scope-pills">
                {[
                  { label: 'Physical Access', val: ef.physicalInScope },
                  { label: 'Social Engineering', val: ef.socialEngineeringInScope },
                  { label: 'Detection Testing', val: ef.detectionTesting },
                ].map(item => (
                  <span key={item.label} className={`scope-pill ${item.val === 'yes' ? 'pill-yes' : 'pill-no'}`}>
                    {item.val === 'yes' ? '✓' : '✗'} {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {optionalSections('after_pricing')}

        {/* ── TIMELINE ── */}
        <div className="section page-break">
          <div className="wrap">
            <div className="section-label">{isRedTeam ? '04 Methodology' : 'Audit Timeline'}</div>
            <h2 className="section-title">{isRedTeam ? <>Intelligence-led. <span className="accent">Objective-based.</span></> : <>Done in <span className="accent">{proposal.days} {proposal.days == 1 ? 'Day' : 'Days'}</span></>}</h2>
            <p className="section-sub">{isRedTeam ? 'Structured adversarial methodology modelled on real-world attacker playbooks.' : 'Fast without cutting corners. Here is exactly what happens and when.'}</p>
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

        {optionalSections('after_timeline')}

        {/* ── DELIVERABLES ── */}
        <div className="section page-break">
          <div className="wrap">
            <div className="section-label">Deliverables</div>
            <h2 className="section-title">What You <span className="accent">Walk Away With</span></h2>
            <p className="section-sub">{isRedTeam ? 'Every red team engagement produces actionable intelligence, not just a list of CVEs.' : 'Three compounding credibility assets not just a PDF.'}</p>
            <div className="del-grid">
              {(isRedTeam ? [
                { icon: '📋', title: 'Executive Summary Report',  desc: 'Board-ready narrative of risk posture, key findings, and strategic recommendations.', tag: 'Board-ready' },
                { icon: '🔬', title: 'Full Technical Report',     desc: 'Step-by-step exploitation chains, proof-of-concept evidence, CVSS scoring, and remediation guidance.', tag: 'Engineer-ready' },
                { icon: '🗺️', title: 'Remediation Roadmap',      desc: 'Prioritised action plan with effort/impact scoring and a 30/60/90-day fix schedule.', tag: 'Actionable' },
                { icon: '🎤', title: 'Live Debrief Session',      desc: 'Walkthrough of all findings with your security and engineering teams. Attack replay and Q&A.', tag: 'Knowledge transfer' },
                { icon: '📡', title: 'Threat Intelligence Brief', desc: 'Curated intelligence on threat actors most likely to target your sector, with attacker TTPs.', tag: 'Sector-specific' },
                { icon: '🔐', title: 'Audit-Ready Documentation', desc: 'Report formats compatible with ISO 27001, SOC 2, PCI-DSS, MAS TRM, DORA.', tag: 'Regulatory-ready' },
              ] : [
                { icon: '📋', title: 'Audit Report',   desc: 'Full findings with severity ratings, exploit scenarios, and fix guidance. Built for devs and investors alike.', tag: 'Public-ready' },
                { icon: '🛡️', title: 'Security Badge', desc: 'Display it on your site, pitch deck, and docs. Instant trust signal to users, VCs, and exchange listing teams.', tag: 'Display anywhere' },
                { icon: '⛓️', title: 'On-Chain Seal',  desc: 'Timestamped certificate, optionally hash-anchored on-chain. Covers exchange listings, grants, and VC due diligence.', tag: 'Hash-anchored' },
              ]).map(d => (
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

        {optionalSections('after_deliverables')}

        {/* ── VULN COVERAGE ── */}
        {!isRedTeam && (vulnRows || customVulns.length > 0) && (
          <div className="section page-break">
            <div className="wrap">
              <div className="section-label">Vulnerability Coverage</div>
              <h2 className="section-title">{vulnRows ? <>{vulnRows.length} Categories <span className="accent">Mapped to Standards</span></> : <><span className="accent">Custom</span> Vulnerability Coverage</>}</h2>
              <p className="section-sub">Every category we assess, with the specific checkpoints our auditors verify for each.</p>
              <table className="vuln-table">
                <thead><tr><th className="vuln-th">VULNERABILITY</th><th className="vuln-th">CHECKPOINTS</th></tr></thead>
                <tbody>
                  {(vulnRows || customVulns).map((row, i) => (
                    <tr key={i}>
                      <td className="vuln-td" style={{ fontWeight: 700, width: '36%' }}>{row.vuln || row.category}</td>
                      <td className="vuln-td"><ul>{(row.checks || []).map((c, j) => <li key={j}>{c}</li>)}</ul></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {optionalSections('after_vulnerabilities')}

        {/* ── SOCIAL PROOF ── */}
        <div className="section page-break">
          <div className="wrap">
            <div className="section-label">Social Proof</div>
            <h2 className="section-title">Trusted by <span className="accent">300+ Companies</span></h2>
            <div className="stats-row">
              {[{ num: '4.5M+', lbl: 'Scans on SolidityScan' }, { num: '300+', lbl: 'Companies' }, { num: '90+', lbl: 'Blockchain platforms' }].map(s => (
                <div key={s.lbl} className="stat-box"><span className="stat-num">{s.num}</span><span className="stat-lbl">{s.lbl}</span></div>
              ))}
            </div>
            <div className="testimonial avoid-break">
              <p className="test-quote">"CredShields found a critical reentrancy vulnerability in our staking contract 48 hours before our mainnet launch. We would have lost everything. The team was sharp and actually understood our protocol architecture."</p>
              <div className="test-author">Marcus K.</div><div className="test-role">CTO, DeFi Lending Protocol</div>
            </div>
            <div className="testimonial avoid-break">
              <p className="test-quote">{isRedTeam ? '"The red team engagement was the most revealing exercise we\'ve conducted. They got further than we thought possible, through our Telegram admin account, in less than 72 hours."' : '"The audit report was the first thing our lead investor asked for in due diligence. Having the CredShields badge and the on-chain seal reference in our data room closed that conversation immediately."'}</p>
              <div className="test-author">{isRedTeam ? 'James R.' : 'Sarah L.'}</div>
              <div className="test-role">{isRedTeam ? 'CISO, Web3 Financial Protocol' : 'Founder, RWA Tokenization Protocol'}</div>
            </div>
          </div>
        </div>

        {optionalSections('after_social_proof')}

        {/* ── PAST AUDITS ── */}
        <div className="section page-break">
          <div className="wrap">
            <div className="section-label">Track Record</div>
            <h2 className="section-title">Selected <span className="accent">{isRedTeam ? 'Past Engagements' : 'Past Audits'}</span></h2>
            {(isRedTeam ? [
              { name: 'DeFi Protocol Red Team',       tag: 'Web3 / DeFi',      cls: 'tag-defi',  finding: 'Admin compromise via Telegram SIM-swap in 72h' },
              { name: 'Web3 Exchange Infrastructure', tag: 'Exchange / CeFi',  cls: 'tag-rwa',   finding: 'CI/CD pipeline → prod key access via supply chain' },
              { name: 'DAO Governance Red Team',      tag: 'Governance / DAO', cls: 'tag-stake', finding: 'Governance takeover via delegate manipulation' },
              { name: 'AI-Enabled Fintech',           tag: 'AI / LLM Risk',   cls: 'tag-nft',   finding: 'System prompt extraction → data exfiltration via RAG' },
            ] : [
              { name: 'Tribally Gaming Protocol',   tag: 'Gaming / NFT', cls: 'tag-nft',   finding: '2 Critical, 4 High bugs found' },
              { name: 'DeFi Lending Protocol',      tag: 'DeFi',         cls: 'tag-defi',  finding: '1 Critical reentrancy pre-launch' },
              { name: 'RWA Tokenization Platform',  tag: 'RWA',          cls: 'tag-rwa',   finding: '3 High oracle manipulation vectors' },
              { name: 'Staking & Rewards Protocol', tag: 'Staking',      cls: 'tag-stake', finding: 'Flash loan + access control fixes' },
            ]).map(a => (
              <div key={a.name} className="audit-row avoid-break">
                <div><div className="audit-name">{a.name}</div><span className={`audit-tag ${a.cls}`}>{a.tag}</span></div>
                <div className="audit-finding">{a.finding}</div>
              </div>
            ))}
          </div>
        </div>

        {optionalSections('after_track_record')}

        {optionalSections('after_comparison')}
        {optionalSections('before_cta')}

        {/* ── CTA ── */}
        <div className="cta">
          <div className="wrap">
            <h2 className="cta-title">
              {isRedTeam ? <>Ready to know<br /><span className="accent">where you&apos;re exposed?</span></> : <>Your security. Your users.<br /><span className="accent">Your reputation.</span></>}
            </h2>
            <p className="cta-sub">
              {isRedTeam ? "The first conversation is confidential and focused on your specific threat model. We'll help you determine the right scope before any commitment." : "Don't ship unaudited. One exploited vulnerability undoes everything you've built: the community, the trust, the TVL."}
            </p>
            <a className="cta-btn" href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer">
              {isRedTeam ? '→ Book a Scoping Call' : '→ Book Your Audit Slot Now'}
            </a>
            <p className="cta-tg">Or DM on Telegram: <strong style={{ color: '#e8edf5' }}>@cred_shields</strong>. We respond within 2 hours.</p>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="wrap">
          <footer>
            <span>CredShields Technologies Pte. Ltd. · 20A Tanjong Pagar Road, Singapore 088443</span>
            <a href="https://credshields.com">credshields.com</a>
          </footer>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          // Auto-trigger print on load if ?print=1
          if (window.location.search.includes('print=1')) {
            window.addEventListener('load', () => {
              setTimeout(() => window.print(), 800);
            });
          }
        ` }} />

    </>
  )
}
