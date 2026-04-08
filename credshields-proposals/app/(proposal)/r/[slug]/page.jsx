import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PROPOSAL_TYPES } from '../../../../lib/proposalTypes'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export default async function RedTeamProposalPage({ params }) {
  const { slug } = await params

  const { data: proposal, error } = await db()
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !proposal) notFound()

  const config = PROPOSAL_TYPES.red_team || PROPOSAL_TYPES.smart_contract
  const fmt = n => Number(n).toLocaleString()

  const ef = proposal.extra_fields
    ? (typeof proposal.extra_fields === 'string' ? JSON.parse(proposal.extra_fields) : proposal.extra_fields)
    : {}

  let timeline = config.methodology || []
  if (proposal.custom_timeline) { try { timeline = JSON.parse(proposal.custom_timeline) } catch (e) {} }

  const compRows = config.competitors(proposal.final_price).filter(c => !c.highlight)

  const disc = proposal.original_price > proposal.final_price
    ? Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100)
    : 0

  return (
    <>
      <title>{`${proposal.company} | Red Team Engagement`}</title>
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
          .testimonial, .audit-row, .threat-card, .tier-card { break-inside: avoid; page-break-inside: avoid; }
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

        /* COVER STATS */
        .cover-stats { display: flex; gap: 40px; flex-wrap: wrap; margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); }
        .cover-stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
        .cover-stat-val { font-size: 28px; font-weight: 300; letter-spacing: -0.02em; line-height: 1.2; }
        .cover-stat-val .accent { color: var(--green); font-weight: 600; }

        /* SECTIONS */
        .section { padding: 64px 0; border-bottom: 1px solid var(--border); }
        .section-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--green); margin-bottom: 10px; font-family: 'IBM Plex Mono', monospace; }
        .section-title { font-size: 32px; font-weight: 800; line-height: 1.15; margin-bottom: 14px; }
        .section-sub { font-size: 14px; color: var(--muted); max-width: 540px; margin-bottom: 32px; font-weight: 300; line-height: 1.8; }
        .accent { color: var(--green); }

        /* QUOTE BLOCK */
        .quote-block { border-left: 2px solid var(--green); padding: 20px 24px; background: rgba(79,255,164,0.04); border-radius: 0 8px 8px 0; margin: 24px 0; }
        .quote-block p { font-size: 15px; font-style: italic; color: var(--white); line-height: 1.65; font-weight: 300; }
        .quote-block cite { display: block; margin-top: 10px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 0.07em; font-style: normal; }

        /* URGENCY */
        .urgency { display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, rgba(255,79,106,0.08), rgba(255,79,106,0.04)); border: 1px solid rgba(255,79,106,0.2); border-radius: 8px; padding: 14px 20px; margin-bottom: 24px; font-size: 13px; color: #ffb3be; }

        /* THREAT CARDS */
        .threat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .threat-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
        .threat-icon { font-size: 22px; margin-bottom: 8px; display: block; }
        .threat-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
        .threat-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }

        /* VULN TABLE */
        .vuln-table { width: 100%; border-collapse: collapse; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        .vuln-th { padding: 10px 16px; text-align: left; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); font-family: 'IBM Plex Mono', monospace; }
        .vuln-td { padding: 12px 16px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
        .vuln-td ul { margin: 0; padding-left: 16px; }
        .vuln-td li { font-size: 11px; color: var(--muted); line-height: 1.7; }

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
        .del-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .del-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
        .del-icon { font-size: 24px; margin-bottom: 10px; display: block; }
        .del-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
        .del-desc { font-size: 11px; color: var(--muted); line-height: 1.6; }
        .del-tag { margin-top: 10px; display: inline-block; background: rgba(79,255,164,0.08); border: 1px solid rgba(79,255,164,0.15); color: var(--green); font-size: 10px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }

        /* TIER CARDS */
        .tier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 32px; }
        .tier-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 24px; position: relative; }
        .tier-card.featured { border-color: rgba(79,255,164,0.2); background: linear-gradient(145deg, rgba(15,42,26,0.6), var(--card)); }
        .tier-card.featured::before { content: 'RECOMMENDED'; position: absolute; top: -10px; left: 20px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.15em; color: var(--green); background: var(--bg); padding: 2px 8px; border: 1px solid rgba(79,255,164,0.2); border-radius: 4px; }
        .tier-name { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--green); margin-bottom: 8px; }
        .tier-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tier-desc { font-size: 12px; color: var(--muted); line-height: 1.65; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); font-weight: 300; }
        .tier-features { list-style: none; padding: 0; margin: 0; }
        .tier-features li { font-size: 12px; color: var(--muted); padding: 5px 0 5px 16px; position: relative; border-bottom: 1px solid rgba(79,255,164,0.04); }
        .tier-features li:last-child { border: none; }
        .tier-features li::before { content: '\\2192'; position: absolute; left: 0; color: var(--green); font-size: 10px; top: 7px; }

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

        /* AUDIT ROWS */
        .audit-row { display: flex; justify-content: space-between; align-items: center; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 20px; margin-bottom: 8px; }
        .audit-name { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
        .audit-tag { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-family: 'IBM Plex Mono', monospace; }
        .audit-finding { font-size: 12px; color: var(--muted); }
        .tag-defi  { background: rgba(79,130,255,0.12); color: #7faeff; border: 1px solid rgba(79,130,255,0.2); }
        .tag-nft   { background: rgba(200,79,255,0.12); color: #d07aff; border: 1px solid rgba(200,79,255,0.2); }
        .tag-rwa   { background: rgba(255,200,79,0.12); color: #ffd07a; border: 1px solid rgba(255,200,79,0.2); }
        .tag-stake { background: rgba(79,255,164,0.08); color: #4fffa4; border: 1px solid rgba(79,255,164,0.15); }

        /* CTA */
        .cta { padding: 80px 0 64px; text-align: center; }
        .cta-title { font-size: 36px; font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
        .cta-sub { font-size: 15px; color: var(--muted); max-width: 460px; margin: 0 auto 32px; font-weight: 300; line-height: 1.7; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg,#4fffa4,#2de88a); color: #080b12; font-weight: 800; font-size: 15px; padding: 14px 36px; border-radius: 8px; text-decoration: none; }
        .cta-tg { margin-top: 16px; font-size: 12px; color: var(--muted); }

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
          <div className="eyebrow">Red Team Engagement</div>
          <h1 className="cover-title" dangerouslySetInnerHTML={{ __html: 'Think like<br/>the enemy.<br/><span class="accent">Before they do.</span>' }} />
          <p className="cover-sub">
            {`A full-spectrum adversarial engagement designed for ${proposal.company}, before a real attacker finds what your defences missed.`}
          </p>
          <div className="cover-meta">
            <div><div className="meta-label">Prepared by</div><div className="meta-value">CredShields Technologies Pte. Ltd.</div></div>
            <div><div className="meta-label">Scope</div><div className="meta-value">{proposal.company}</div></div>
            <div><div className="meta-label">Engagement Price</div><div className="meta-green">${fmt(proposal.final_price)} USD</div></div>
            {ef.threatActorProfile && <div><div className="meta-label">Threat Profile</div><div className="meta-value">{ef.threatActorProfile}</div></div>}
          </div>
          <div className="cover-badge">
            <span className="red-dot" />
            Confidential engagement. NDA applies
          </div>
          <div className="cover-stats">
            <div>
              <div className="cover-stat-label">Avg. enterprise breach cost</div>
              <div className="cover-stat-val">$4.8<span className="accent">M</span></div>
            </div>
            <div>
              <div className="cover-stat-label">Avg. dwell time undetected</div>
              <div className="cover-stat-val">194<span className="accent">d</span></div>
            </div>
            <div>
              <div className="cover-stat-label">Attacks via social engineering</div>
              <div className="cover-stat-val">82<span className="accent">%</span></div>
            </div>
            <div>
              <div className="cover-stat-label">Breaches from phishing</div>
              <div className="cover-stat-val">36<span className="accent">%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* -- 01 EXECUTIVE SUMMARY -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">01 Executive Summary</div>
          <h2 className="section-title">The threat is real. <span className="accent">The question is readiness.</span></h2>
          <p className="section-sub">Traditional penetration testing finds known vulnerabilities in predefined scope. Red teaming finds what real attackers exploit: the gaps between your controls, your people, your processes, and your assumptions about how well they work together.</p>
          <div className="quote-block avoid-break">
            <p>{'"A red team engagement is not about finding vulnerabilities. It\'s about determining whether a determined adversary can achieve a specific objective inside your organisation, and whether your people, processes, and technology would stop them."'}</p>
            <cite>Core Philosophy, CredShields Red Team Practice</cite>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 680, fontWeight: 300 }}>
            {"This proposal outlines a structured, intelligence-led red team engagement covering your full attack surface: external perimeter and web applications, internal network and Active Directory, cloud environments, email and social engineering, physical premises, and insider threat simulation. CredShields operates as a genuine adversary using real-world TTPs mapped to the MITRE ATT&CK framework, not a checklist exercise."}
          </p>
        </div>
      </div>

      {/* -- 02 THREAT LANDSCAPE -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">02 Threat Landscape</div>
          <h2 className="section-title">Why red teaming. <span className="accent">Why now.</span></h2>
          <p className="section-sub">The modern enterprise attack surface spans cloud, identity, endpoints, email, and people. Adversaries are patient, well-resourced, and designed to evade standard controls. Compliance-driven testing alone does not validate real resilience.</p>
          <div className="threat-grid">
            {[
              { icon: '\uD83C\uDF10', title: 'External Perimeter Exploitation', desc: 'Internet-facing apps, APIs, and exposed services are the first point of entry. Attackers probe continuously, your team tests periodically.' },
              { icon: '\uD83C\uDFE2', title: 'Active Directory and Identity',   desc: 'Credential theft, pass-the-hash, Kerberoasting, and AD misconfigurations grant attackers free movement once inside your network.' },
              { icon: '\u2601\uFE0F', title: 'Cloud Misconfigurations',          desc: 'Exposed IAM credentials, overpermissioned service accounts, and misconfigured S3/blob storage are among the most exploited enterprise attack vectors.' },
              { icon: '\uD83D\uDCE7', title: 'Phishing and Social Engineering', desc: '82% of breaches involve the human element. Targeted spear-phishing campaigns bypass email controls that generic tests never challenge.' },
              { icon: '\uD83D\uDEAA', title: 'Physical Security Gaps',          desc: 'Tailgating, badge cloning, and rogue device deployment can bypass every logical control, and rarely get tested until it is too late.' },
              { icon: '\uD83D\uDD17', title: 'Supply Chain and Third-Party Risk', desc: 'Vendor access, third-party integrations, and SaaS platforms extend your trust boundary far beyond what your internal controls cover.' },
            ].map(t => (
              <div key={t.title} className="threat-card avoid-break">
                <span className="threat-icon">{t.icon}</span>
                <div className="threat-title">{t.title}</div>
                <div className="threat-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -- 03 SCOPE OF SERVICES -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">03 Scope of Services</div>
          <h2 className="section-title">Six attack vectors. <span className="accent">One integrated simulation.</span></h2>
          <p className="section-sub">Each vector is assessed using real-world attacker TTPs mapped to the MITRE ATT&CK framework. Engagements can be run as a full hybrid exercise or scoped per vector based on your priorities.</p>
          <table className="vuln-table">
            <thead>
              <tr>
                <th className="vuln-th" style={{ width: '28%' }}>Attack Vector</th>
                <th className="vuln-th">Coverage and Checkpoints</th>
              </tr>
            </thead>
            <tbody>
              {[
                { vector: 'External Perimeter and Web Applications', checks: ['Subdomain and asset enumeration', 'Authentication bypass testing', 'SQL injection and injection flaws', 'Broken access control', 'API security assessment', 'Exposed credential detection', 'JWT and session token analysis', 'SSL/TLS configuration review'] },
                { vector: 'Internal Network and Active Directory', checks: ['Internal network reconnaissance', 'AD enumeration and attack paths', 'Kerberoasting and AS-REP roasting', 'Pass-the-hash and pass-the-ticket', 'Privilege escalation chains', 'Lateral movement simulation', 'Domain controller compromise', 'Data exfiltration path mapping'] },
                { vector: 'Cloud Infrastructure (AWS, Azure, GCP)', checks: ['IAM misconfiguration review', 'Exposed credentials in source/CI', 'S3/blob storage access testing', 'Lambda and serverless abuse', 'Cross-account pivot attempts', 'Monitoring and alerting gaps', 'Service principal exploitation', 'Region evasion techniques'] },
                { vector: 'Social Engineering and Phishing', checks: ['Targeted spear-phishing campaigns', 'Vishing and voice deception', 'Smishing (SMS phishing)', 'Pretexting and impersonation', 'Credential harvesting pages', 'MFA bypass simulation', 'Executive and finance targeting', 'Employee awareness benchmarking'] },
                { vector: 'Physical Security Assessment', checks: ['Tailgating and access bypass', 'RFID and badge cloning', 'Rogue device deployment', 'Wi-Fi rogue access point testing', 'Lock picking and physical access', 'CCTV blind spot mapping', 'Clean desk policy validation', 'Dumpster diving and data disposal'] },
                { vector: 'OSINT and Threat Intelligence', checks: ['External digital footprint mapping', 'Dark web credential monitoring', 'Leaked data and source code detection', 'Executive and employee exposure', 'Domain typosquatting detection', 'Third-party and vendor OSINT', 'Brand impersonation monitoring', 'Threat actor profiling'] },
              ].map((row, i) => (
                <tr key={i} className="avoid-break">
                  <td className="vuln-td" style={{ fontWeight: 700, width: '28%' }}>{row.vector}</td>
                  <td className="vuln-td"><ul>{row.checks.map((c, j) => <li key={j}>{c}</li>)}</ul></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* -- 04 METHODOLOGY -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">04 Methodology</div>
          <h2 className="section-title">Intelligence-led. <span className="accent">Objective-based.</span></h2>
          <p className="section-sub">Our methodology is structured around real attacker playbooks and MITRE ATT&CK TTPs, not generic pentest checklists. Every phase is designed to answer a specific question about your resilience, not just to generate findings.</p>
          {[
            { day: 'Days 1-3',            title: 'Threat Modelling and Scoping',              desc: 'We work with you to define crown jewels, the threat actors most likely to target your sector, rules of engagement, and success criteria (objective-based). This determines which attack paths we prioritise and how deeply each vector is tested.' },
            { day: 'Days 3-7',            title: 'Passive Reconnaissance (OSINT)',            desc: 'We build a complete picture of your organisation from an attacker\'s perspective: domains, subdomains, IP ranges, exposed services, employee data, leaked credentials, third-party exposures, and any publicly available intelligence that a real adversary would use before launching an attack.' },
            { day: 'Days 7-15',           title: 'Active External Attack Simulation',         desc: 'Targeted exploitation of external-facing systems using intelligence gathered in the previous phase. Web applications, APIs, email gateways, VPN portals, and exposed services are tested for authentication weaknesses, injection flaws, and configuration issues, with a focus on achieving initial access, not just enumerating issues.' },
            { day: 'Days 15-22',          title: 'Internal Simulation and Lateral Movement',  desc: 'Once initial access is established (or simulated from an assumed-breach position), we perform internal network reconnaissance, Active Directory enumeration, privilege escalation, and lateral movement, simulating how an attacker would move toward your defined crown jewels while evading detection.' },
            { day: 'Days 7-22',           title: 'Physical and Social Engineering',           desc: 'Concurrent with technical testing, our operators conduct targeted social engineering campaigns against your employees and, where in scope, attempt physical access to your premises through tailgating, badge cloning, and rogue device deployment.' },
            { day: 'Days 23-28',          title: 'Reporting, Debrief and Remediation Roadmap', desc: 'Full written report delivered including executive summary, attack narrative, technical findings, CVSS risk ratings, and a prioritised remediation roadmap. We conduct a live debrief with your security and leadership teams and remain available for fix review and re-test on critical findings.' },
          ].map((item, i) => (
            <div key={i} className="tl-row avoid-break">
              <div className="tl-day">{item.day}</div>
              <div>
                <div className="tl-title">{item.title}</div>
                <div className="tl-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -- 05 DELIVERABLES -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">05 Deliverables</div>
          <h2 className="section-title">What You <span className="accent">Receive</span></h2>
          <p className="section-sub">Every red team engagement produces actionable intelligence, not just a list of CVEs.</p>
          <div className="del-grid">
            {[
              { icon: '\uD83D\uDCCB', title: 'Executive Summary Report',    desc: 'Board-ready risk narrative covering overall security posture, key attack paths, and strategic recommendations. No jargon.', tag: 'Board-ready' },
              { icon: '\u2694\uFE0F', title: 'Attack Narrative',             desc: 'Step-by-step account of how far we got, which controls failed, what data was accessible, and how a real attacker would have used that access.', tag: 'Story-driven' },
              { icon: '\uD83D\uDD2C', title: 'Full Technical Report',       desc: 'All findings with CVSS scoring, business impact, PoC evidence, root cause analysis, and specific remediation guidance per issue.', tag: 'Engineer-ready' },
              { icon: '\uD83D\uDDFA\uFE0F', title: 'Remediation Roadmap',   desc: 'Prioritised fix plan with effort and impact scoring, owner assignment templates, and a 30/60/90-day remediation schedule.', tag: 'Actionable' },
              { icon: '\uD83C\uDF99\uFE0F', title: 'Live Debrief Session',  desc: 'Full attack replay with your security, IT, and leadership teams. Q&A session for complete knowledge transfer and lessons learned.', tag: 'Knowledge transfer' },
              { icon: '\u2705',       title: 'Re-test and Attestation',      desc: 'Re-test of critical and high findings after remediation, with a signed attestation confirming verified closure.', tag: 'Verified' },
              { icon: '\uD83D\uDCCA', title: 'Risk and Maturity Rating',    desc: 'Overall security maturity score across tested domains with benchmark comparison against industry peers.', tag: 'Benchmarked' },
              { icon: '\uD83D\uDD10', title: 'Compliance-Ready Documentation', desc: 'Report formats compatible with ISO 27001, SOC 2, PCI-DSS, MAS TRM, DORA, and applicable regulatory frameworks.', tag: 'Regulatory-ready' },
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

      {/* -- 06 ENGAGEMENT TIERS -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">06 Engagement Tiers</div>
          <h2 className="section-title">Scoped to your <span className="accent">risk profile.</span></h2>
          <p className="section-sub">Three engagement structures depending on your threat model, compliance requirements, and internal security maturity. All tiers are customisable.</p>
          <div className="tier-grid">
            <div className="tier-card avoid-break">
              <div className="tier-name">Tier I</div>
              <div className="tier-title">External</div>
              <p className="tier-desc">Focused adversarial assessment of your externally-facing attack surface. Ideal for organisations new to red teaming or with a specific external perimeter concern.</p>
              <ul className="tier-features">
                <li>External perimeter and web apps</li>
                <li>OSINT and passive reconnaissance</li>
                <li>Phishing simulation (1 campaign)</li>
                <li>2 to 4 week engagement</li>
                <li>Technical and executive report</li>
                <li>Best for: First engagement, compliance baseline</li>
              </ul>
            </div>
            <div className="tier-card featured avoid-break">
              <div className="tier-name">Tier II</div>
              <div className="tier-title">Hybrid</div>
              <p className="tier-desc">Full-scope external and internal adversarial simulation including cloud, Active Directory, social engineering, and physical testing. The recommended scope for most enterprise clients.</p>
              <ul className="tier-features">
                <li>All external vectors plus internal AD/network</li>
                <li>Cloud environment testing (AWS/Azure/GCP)</li>
                <li>Social engineering campaign</li>
                <li>Physical security assessment</li>
                <li>6 to 10 week engagement</li>
                <li>Full report suite, debrief, re-test</li>
                <li>Best for: Enterprise, regulated industries, BFSI</li>
              </ul>
            </div>
            <div className="tier-card avoid-break">
              <div className="tier-name">Tier III</div>
              <div className="tier-title">Continuous</div>
              <p className="tier-desc">Ongoing adversarial programme simulating persistent, advanced threat actors over a 12-month cycle, with purple team integration and quarterly reviews.</p>
              <ul className="tier-features">
                <li>All attack vectors, continuous cadence</li>
                <li>Purple team collaboration</li>
                <li>Threat actor simulation (nation-state / APT)</li>
                <li>Quarterly executive reviews</li>
                <li>Incident response integration</li>
                <li>Best for: Government, critical infrastructure, Tier 1 BFSI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* -- 07 PRICING -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">07 Pricing</div>
          <h2 className="section-title">Engagement <span className="accent">Investment</span></h2>
          <p className="section-sub">All deliverables included. Scope and timeline customised per engagement.</p>
          <div className="price-card avoid-break">
            <div className="price-head">
              <span className="price-head-txt">{proposal.company} | Red Team Engagement</span>
              {disc > 0 && <span className="disc-badge">{disc}% DISCOUNT APPLIED</span>}
            </div>
            {[
              ['Client', proposal.client_name],
              ...(ef.crownJewels ? [['Crown Jewels', ef.crownJewels]] : []),
              ...(ef.threatActorProfile ? [['Threat Profile', ef.threatActorProfile]] : []),
              ['Duration', `${proposal.days} Phases`],
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
              {['50% upfront, 50% on delivery', 'Comprehensive NDA in place', 'All findings under strict confidentiality', 'Remediation support included'].map(t => <span key={t}>{t}</span>)}
            </div>
          </div>
          {proposal.scope_description && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', marginTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>Engagement Scope</div>
              <p>{proposal.scope_description}</p>
            </div>
          )}
        </div>
      </div>

      {/* -- TRACK RECORD -- */}
      <div className="section page-break">
        <div className="wrap">
          <div className="section-label">Track Record</div>
          <h2 className="section-title">Selected <span className="accent">Past Engagements</span></h2>
          {[
            { name: 'DeFi Protocol Red Team',       tag: 'Web3 / DeFi',      cls: 'tag-defi',  finding: 'Admin compromise via Telegram SIM-swap in 72h' },
            { name: 'Web3 Exchange Infrastructure', tag: 'Exchange / CeFi',  cls: 'tag-rwa',   finding: 'CI/CD pipeline to prod key access via supply chain' },
            { name: 'DAO Governance Red Team',      tag: 'Governance / DAO', cls: 'tag-stake', finding: 'Governance takeover via delegate manipulation' },
            { name: 'AI-Enabled Fintech',           tag: 'AI / LLM Risk',   cls: 'tag-nft',   finding: 'System prompt extraction to data exfiltration via RAG' },
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
                <th className="comp-th-us">CredShields {'\u2726'}</th>
                {compRows.map(c => <th key={c.name} className="comp-th">{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Price',        us: `$${fmt(proposal.final_price)}`,    vals: compRows.map(c => c.price) },
                { label: 'Turnaround',   us: `${proposal.days} phases`,          vals: compRows.map(c => c.turnaround) },
                { label: 'Web3-native',  us: '\u2713 Purpose-built',             vals: compRows.map(() => '\u2717') },
                { label: 'Remediation',  us: '\u2713 Included',                  vals: compRows.map(() => '\u2717') },
                { label: 'OWASP mapped', us: '\u2713 Co-authored',               vals: compRows.map(() => '-') },
                { label: 'Direct support',us: '\u2713 Telegram',                 vals: compRows.map(c => c.notes) },
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
            Ready to test<br /><span className="accent">your defences?</span>
          </h2>
          <p className="cta-sub">
            {"The first conversation is confidential and no-obligation. We will help you scope the right engagement before any commitment."}
          </p>
          <a className="cta-btn" href="https://calendly.com/credshields-marketing/15min" target="_blank" rel="noreferrer">
            {'\u2192'} Book a Scoping Call
          </a>
          <p className="cta-tg">Or DM on Telegram: <strong style={{ color: '#e8edf5' }}>@cred_shields</strong>. We respond within 2 hours.</p>
        </div>
      </div>

      {/* -- FOOTER -- */}
      <div className="wrap">
        <footer>
          <span>CredShields Technologies Pte. Ltd. {'\u00B7'} 20A Tanjong Pagar Road, Singapore 088443</span>
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
