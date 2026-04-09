import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export default async function IntegrationProposalPage({ params }) {
  const { id } = await params
  const { data: prop, error } = await db().from('integration_proposals').select('*').eq('id', id).single()
  if (error || !prop) notFound()

  const chainName = prop.chain_name || 'Unichain'
  const explorerName = prop.explorer_name || 'Unichain Explorer'
  const integrationFee = prop.integration_fee || '$2500'

  return (
    <>
      <title>{`${prop.company} | SolidityScan Integration Proposal`}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #030a06;
          color: #fff;
          font-family: 'Inter', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body { background: #030a06 !important; }
          .slide { break-after: page; page-break-after: always; }
          .slide:last-child { break-after: auto; page-break-after: auto; }
          @page { size: 1440px 810px; margin: 0; }
          .no-print { display: none !important; }
        }

        .slide {
          width: 1440px;
          height: 810px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          background: #030a06;
        }

        /* Blue glow - top right */
        .glow-blue {
          position: absolute;
          top: -120px;
          right: -120px;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: #3200ff;
          opacity: 0.5;
          filter: blur(385px);
          pointer-events: none;
          z-index: 0;
        }

        /* Green glow - bottom left */
        .glow-green {
          position: absolute;
          bottom: -150px;
          left: -150px;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, #52ff00 0%, #319900 100%);
          opacity: 0.4;
          filter: blur(385px);
          pointer-events: none;
          z-index: 0;
        }

        .slide-content {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          padding: 50px 70px;
          display: flex;
          flex-direction: column;
        }

        /* Watermark bottom-right */
        .watermark {
          position: absolute;
          bottom: 20px;
          right: 30px;
          opacity: 0.2;
          font-family: 'Barlow', sans-serif;
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #52FF00, #00EEFD);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          pointer-events: none;
          z-index: 2;
        }

        /* Blue gradient header bar */
        .header-bar {
          background: linear-gradient(91deg, rgba(51,0,255,1) 0%, rgba(23,74,255,0) 100%);
          height: 62px;
          width: 647px;
          display: flex;
          align-items: center;
          padding-left: 30px;
          border-radius: 4px;
          margin-bottom: 36px;
          flex-shrink: 0;
        }
        .header-bar h2 {
          font-family: 'Barlow', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
        }
        .header-bar h2 .green { color: #39ff14; }
        .header-bar h2 .blue { color: #00eeff; }

        /* Dark cards */
        .dark-card {
          background: linear-gradient(180deg, rgba(23,23,23,1) 0%, rgba(0,0,0,0) 100%);
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 28px;
        }

        /* Green timeline dot */
        .tl-dot {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #39fa4c;
          flex-shrink: 0;
        }
        .tl-line {
          width: 1px;
          background: rgba(57,250,76,0.4);
          flex-grow: 1;
          min-height: 20px;
        }

        /* Phase badge */
        .phase-badge {
          display: inline-block;
          background: #52FF00;
          color: #000;
          font-family: 'Barlow', sans-serif;
          font-weight: 700;
          font-size: 28px;
          padding: 6px 18px;
          border-radius: 4px;
          margin-right: 14px;
        }

        /* Cover bracket corners */
        .bracket-tl, .bracket-tr, .bracket-bl, .bracket-br {
          position: absolute;
          width: 40px;
          height: 40px;
          border-color: #52FF00;
          border-style: solid;
          z-index: 2;
        }
        .bracket-tl { top: 40px; left: 40px; border-width: 2px 0 0 2px; }
        .bracket-tr { top: 40px; right: 40px; border-width: 2px 2px 0 0; }
        .bracket-bl { bottom: 40px; left: 40px; border-width: 0 0 2px 2px; }
        .bracket-br { bottom: 40px; right: 40px; border-width: 0 2px 2px 0; }

        /* Contact grid */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .contact-item {
          background: rgba(23,23,23,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 18px;
        }
        .contact-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
        .contact-value {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          line-height: 1.5;
        }
        .contact-value a {
          color: #52FF00;
          text-decoration: none;
        }
      ` }} />

      {/* Print button */}
      <script dangerouslySetInnerHTML={{ __html: `
        var btn = document.createElement('button');
        btn.className = 'no-print';
        btn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:linear-gradient(135deg,#52FF00,#00EEFD);color:#030a06;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;font-family:Inter,sans-serif;box-shadow:0 4px 20px rgba(82,255,0,0.3)';
        btn.textContent = '\\u2B07 Download PDF';
        btn.onclick = function() { window.print(); };
        document.body.prepend(btn);
      ` }} />


      {/* ===================== SLIDE 1: COVER ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="bracket-tl" />
        <div className="bracket-tr" />
        <div className="bracket-bl" />
        <div className="bracket-br" />
        <div className="slide-content" style={{ justifyContent: 'space-between' }}>
          {/* Top: SolidityScan | Powered by CredShields */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg, #52FF00, #00EEFD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SolidityScan
            </div>
            <div style={{ width: 2, height: 50, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: '#a6a6a6' }}>Powered by</span>
              <img src="/credshields-logo-white.png" alt="CredShields" style={{ height: 50 }} />
            </div>
          </div>

          {/* Middle: Title */}
          <div>
            <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
              <span style={{ background: 'linear-gradient(135deg, #52FF00, #00EEFD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Integration Partnership
              </span>
              <br />
              <span style={{ color: '#fff' }}>Proposal</span>
            </div>

            <div style={{ marginTop: 36 }}>
              <div style={{ fontSize: 28, color: '#fff' }}>Prepared for</div>
              {prop.company_logo && (
                <div style={{ marginTop: 12, marginBottom: 8 }}>
                  <img src={prop.company_logo} alt={prop.company} style={{ height: 70, borderRadius: 8 }} />
                </div>
              )}
              <div style={{ fontFamily: 'Barlow, sans-serif', fontSize: 36, fontWeight: 700, color: '#52FF00', marginTop: 4 }}>
                {prop.company}
              </div>
            </div>
          </div>

          {/* Bottom: Date + Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 24, color: '#d8fee5' }}>
              Date: {prop.proposal_date}
            </div>
            <div>
              <img src="/cert-badges.png" alt="AICPA SOC & OWASP Badges" style={{ height: 55 }} />
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 2: THE PROBLEM ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div className="header-bar">
            <h2>The Problem You Can{"'"}t <span className="green">Afford to Ignore</span></h2>
          </div>

          <div style={{ display: 'flex', gap: 28, flex: 1 }}>
            {/* Left card: The Problem */}
            <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 28 }}>&#128161;</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: '50.4px' }}>The Problem</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                Smart contract exploits don{"'"}t discriminate. Across every chain, every ecosystem, users interact with contracts daily, often with zero visibility into the risks they{"'"}re taking on.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                One unaudited contract. One critical vulnerability. One high profile exploit and user trust evaporates overnight.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                Developers need confidence that their deployments are secure. Users need assurance before they transact.
              </p>
            </div>

            {/* Right card: Our proposal */}
            <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 28 }}>&#128161;</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: '50.4px' }}>Our proposal</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                This proposal outlines a structured integration framework to embed SolidityScan{"'"}s security scoring infrastructure directly within the {explorerName}, strengthening:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {[
                  'Contract-level transparency',
                  'Real-time security visibility',
                  'User trust and ecosystem resilience',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#38ff7e', fontSize: 22, fontWeight: 700 }}>&#x2022;</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#38ff7e' }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', marginTop: 12 }}>
                By integrating native security scoring at the explorer layer, {chainName} can provide developers and users with immediate, standardized risk insights at the point of contract discovery.
              </p>
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 3: SOLIDITYSCAN OVERVIEW ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ maxWidth: 1200, width: '100%' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 500, color: '#ffffff', lineHeight: '45px', marginBottom: 40, textAlign: 'center' }}>
              SolidityScan, developed by CredShields, is an enterprise-grade smart contract security scanner powering <strong style={{ color: '#52FF00' }}>90+ blockchain explorers</strong> and supporting <strong style={{ color: '#52FF00' }}>4.5M+ automated scans</strong> across ecosystems.
            </p>

            {/* Placeholder for blockchain grid screenshot */}
            <div className="dark-card" style={{ width: 1100, height: 500, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>&#x1F310;</div>
                <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>Blockchain Explorer Integration Grid</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>90+ Explorer Integrations</div>
              </div>
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 4: WHY THIS MATTERS ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div className="header-bar">
            <h2>Why This Matters for <span className="green">Your Chain</span></h2>
          </div>

          <div style={{ display: 'flex', gap: 24, flex: 1 }}>
            <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: '50.4px' }}>
                Immediate Risk Visibility
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', flex: 1 }}>
                Every verified contract on {explorerName} displays a live SolidityScan security score, including a full severity breakdown across Critical, High, Medium, and Low vulnerabilities. Users make informed decisions at the point of discovery.
              </p>
            </div>

            <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: '50.4px' }}>
                Ecosystem-Wide Credibility
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', flex: 1 }}>
                Native security scoring signals that {chainName} takes contract safety seriously. This differentiates {chainName} from explorers that leave users flying blind, and makes the ecosystem more attractive to serious builders and capital allocators.
              </p>
            </div>

            <div className="dark-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: '50.4px' }}>
                Zero Friction for Users
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', flex: 1 }}>
                Security insights are embedded directly in the contract detail panel. No tab-switching, no external tools, just seamless, in-context intelligence that elevates the entire explorer experience
              </p>
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 5: PHASE 1 ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div className="header-bar">
            <h2>How We Get There: A <span className="green">Two-Phase Rollout</span></h2>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="phase-badge">Phase 1:</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, fontWeight: 700, color: '#fff' }}>
              Initial Integration &amp; Data Synchronization
            </span>
          </div>

          <div className="dark-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 30, height: '100%' }}>
              {/* Timeline dots column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <div className="tl-dot" />
                <div className="tl-line" />
                <div className="tl-dot" />
              </div>

              {/* Content column */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 24 }}>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 700, color: '#52FF00', marginBottom: 10 }}>
                    Functionalities
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                    SolidityScan connects to {explorerName}{"'"}s verified contract feed, ingests existing and incoming contracts, and begins running automated security analysis. This phase establishes the data pipeline and is the prerequisite for Phase 2
                  </p>
                </div>

                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 700, color: '#52FF00', marginBottom: 10 }}>
                    Timeline
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                    2 weeks from API credential handoff
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 6: PHASE 2 ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div style={{ marginBottom: 24 }}>
            <span className="phase-badge">Phase 2:</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, fontWeight: 700, color: '#fff' }}>
              Native Explorer Integration
            </span>
          </div>

          <div className="dark-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 30, height: '100%' }}>
              {/* Timeline dots column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <div className="tl-dot" />
                <div className="tl-line" />
                <div className="tl-dot" />
                <div className="tl-line" />
                <div className="tl-dot" />
              </div>

              {/* Content column */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 24 }}>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 700, color: '#52FF00', marginBottom: 10 }}>
                    Deliverable
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                    {explorerName} integrates SolidityScan{"'"}s APIs to surface security scores and vulnerability metadata directly within the UI. The security score widget appears in the top-right contract metadata panel, consistent with our integrations on Base and Avascan.
                  </p>
                </div>

                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 700, color: '#52FF00', marginBottom: 10 }}>
                    Timeline
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>
                    To be scoped after Phase 1 kickoff call
                  </p>
                </div>

                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 700, color: '#52FF00', marginBottom: 10 }}>
                    One Time Integration Fee
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 700, color: '#fff' }}>
                    {integrationFee}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 7: SIMILAR INTEGRATIONS ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div className="header-bar">
            <h2><span className="blue">Similar</span> <span className="green">Integrations</span></h2>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', marginBottom: 32 }}>
            SolidityScan has successfully integrated its security analysis into over 60+ Blockscout-based blockchain explorers, including popular explorers for major blockchains. Additionally, integrations with established blockchain explorers like EtherScan, Avascan and SubScan further demonstrate our commitment to enhancing security across the industry.
          </p>

          {/* Placeholder for screenshots */}
          <div className="dark-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>&#x1F5BC;</div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>Integration Screenshots</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>Blockscout, EtherScan, Avascan, SubScan</div>
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 8: PROPOSED UI PLACEMENT ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div className="header-bar">
            <h2>Proposed UI Placement within <span className="green">{explorerName}</span></h2>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', marginBottom: 28 }}>
            Post-integration, every verified contract on {explorerName} will display:
          </p>

          <div style={{ display: 'flex', gap: 32, flex: 1 }}>
            {/* Left: Screenshot */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {prop.explorer_screenshot ? (
                <img
                  src={prop.explorer_screenshot}
                  alt={`${explorerName} UI mockup`}
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}
                />
              ) : (
                <div className="dark-card" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>&#x1F5A5;</div>
                    <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>Explorer UI Preview</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{explorerName}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Bullet points with green arrows */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
              {[
                'Security Score (out of 100) in the top-right contract metadata panel',
                'Severity Distribution: Critical / High / Medium / Low breakdown at a glance',
                'Threat Score alongside the Security Score for dual-layer risk assessment',
                'Full Report CTA: one click to the complete vulnerability analysis',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ color: '#39ff14', fontSize: 30, fontWeight: 700, flexShrink: 0, lineHeight: '42px' }}>&rarr;</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 9: ECOSYSTEM PARTNERSHIP ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content">
          <div className="header-bar">
            <h2><span className="blue">Ecosystem</span> Partnership with <span className="green">{explorerName}</span></h2>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px', marginBottom: 24 }}>
            We want to be an active security layer across the entire {chainName} ecosystem.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
            {[
              `Discounted Service Access: ${chainName} ecosystem projects get exclusive discounted access to CredShields' services and SolidityScan's automated security scanner helping builders ship safer contracts from day one.`,
              `Free Access to 2-Months Pro License: All projects building within the ${chainName} ecosystem receive a complimentary 2-month SolidityScan Pro License.`,
              `Co-Marketing: Joint announcements, co-branded content, and featured placement of ${chainName}'s ecosystem across SolidityScan's channels and external channels.`,
              `Revenue Share Model: For every ${chainName} ecosystem project that subscribes to SolidityScan's paid plans through the partnership, ${chainName} earns a share of the revenue creating a sustainable, mutually aligned growth model.`,
              `Continuous Monitoring: Deployed contracts on ${chainName} get ongoing threat monitoring, flagging new vulnerabilities as they emerge, not just at the point of deployment.`,
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ color: '#39ff14', fontSize: 30, fontWeight: 700, flexShrink: 0, lineHeight: '42px' }}>&rarr;</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 30, fontWeight: 500, color: '#ffffff', lineHeight: '42px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="watermark">SolidityScan</div>
      </div>


      {/* ===================== SLIDE 10: THANK YOU ===================== */}
      <div className="slide">
        <div className="glow-blue" />
        <div className="glow-green" />
        <div className="slide-content" style={{ padding: 0 }}>

          {/* Badges top-right */}
          <img src="/cert-badges.png" alt="Badges" style={{ position:'absolute', top:40, right:60, height:65 }} />

          {/* Thank You - left aligned */}
          <div style={{ position:'absolute', left:141, top:129 }}>
            <div style={{ fontFamily:'Barlow,sans-serif', fontSize:128, fontWeight:700, color:'#52FF00', lineHeight:1 }}>Thank You!</div>
          </div>

          {/* Subtitle */}
          <div style={{ position:'absolute', left:141, top:381 }}>
            <div style={{ fontFamily:'Barlow,sans-serif', fontSize:40, fontWeight:400, color:'#fff', lineHeight:'44px' }}>Feel free to reach out to us if you have any questions</div>
          </div>

          {/* Contact grid - 4 columns */}
          <div style={{ position:'absolute', left:138, top:496, display:'flex', gap:160 }}>
            <div>
              <div style={{ fontSize:30, fontWeight:500, color:'#fff', marginBottom:8 }}>Website</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>www.solidityscan.com</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>www.credshields.com</div>
            </div>
            <div>
              <div style={{ fontSize:30, fontWeight:500, color:'#fff', marginBottom:8 }}>Twitter</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>@solidityscan</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>@credshields</div>
            </div>
            <div>
              <div style={{ fontSize:30, fontWeight:500, color:'#fff', marginBottom:8 }}>Blog</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>blog.solidityscan.com</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>blog.credshields.com</div>
            </div>
            <div>
              <div style={{ fontSize:30, fontWeight:500, color:'#fff', marginBottom:8 }}>Email</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>info@solidityscan.com</div>
              <div style={{ fontSize:25, color:'#fff', lineHeight:'27.5px' }}>info@credshields.com</div>
            </div>
          </div>

          {/* QR code + company info bottom-left */}
          <div style={{ position:'absolute', left:146, top:775, display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ width:120, height:120, background:'#fff', borderRadius:15, border:'1px solid #a4a4a4', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:100, height:100, background:'#000', borderRadius:4 }}></div>
            </div>
            <div>
              <div style={{ fontFamily:'Barlow,sans-serif', fontSize:29, fontWeight:600, color:'#fff', lineHeight:'31.9px' }}>CREDSHIELDS TECHNOLOGIES PTE. LTD.</div>
              <div style={{ fontFamily:'Barlow,sans-serif', fontSize:29, fontWeight:400, color:'#8a94a6', lineHeight:'42px' }}>20A Tanjong Pagar Road, Singapore - 088443</div>
            </div>
          </div>

          {/* SolidityScan + Powered by CredShields bottom-right */}
          <div style={{ position:'absolute', right:60, bottom:50, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontFamily:'Barlow,sans-serif', fontSize:40, fontWeight:700, background:'linear-gradient(135deg,#52FF00,#00EEFD)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>SolidityScan</div>
            <div style={{ width:2, height:60, background:'rgba(138,148,166,0.5)' }}></div>
            <div>
              <div style={{ fontSize:22, color:'#a7a7a7' }}><span style={{ fontWeight:600 }}>Powered </span>by</div>
              <img src="/credshields-logo-white.png" alt="CredShields" style={{ height:40, marginTop:4 }} />
            </div>
          </div>

        </div>
      </div>


      {/* Auto-print support */}
      <script dangerouslySetInnerHTML={{ __html: `
        if (window.location.search.includes('print=1')) {
          window.addEventListener('load', function() {
            setTimeout(function() { window.print(); }, 800);
          });
        }
      ` }} />
    </>
  )
}
