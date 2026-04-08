import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function certIdStr(num) {
  return `CS-AUDIT-${new Date().getFullYear()}-WS-${String(num).padStart(3, '0')}`
}

export default async function CertificatePage({ params }) {
  const { certId } = await params

  const { data: cert, error } = await db()
    .from('certificates')
    .select('*')
    .eq('id', certId)
    .single()

  if (error || !cert) notFound()

  const cid = certIdStr(cert.cert_number)
  const verifyUrl = `https://credshields.com/verify/${cid.toLowerCase()}`
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 120, margin: 1,
    color: { dark: '#4fffa4', light: '#00000000' },
  })

  const totalFindings = cert.critical + cert.high + cert.medium + cert.low + cert.info + cert.gas

  return (
    <>
      <title>{`${cert.project_name} — Audit Certificate`}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #080b12;
          color: #e8edf5;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body { background: #080b12 !important; }
          @page { size: 794px 1123px; margin: 0; }
        }

        .cert {
          width: 794px;
          height: 1123px;
          margin: 0 auto;
          background: #080b12;
          position: relative;
          overflow: hidden;
        }

        /* Corner accents */
        .corner { position: absolute; width: 40px; height: 40px; z-index: 3; }
        .corner-tl { top: 8px; left: 8px; border-top: 2px solid #4fffa4; border-left: 2px solid #4fffa4; }
        .corner-tr { top: 8px; right: 8px; border-top: 2px solid #4fffa4; border-right: 2px solid #4fffa4; }
        .corner-bl { bottom: 8px; left: 8px; border-bottom: 2px solid #4fffa4; border-left: 2px solid #4fffa4; }
        .corner-br { bottom: 8px; right: 8px; border-bottom: 2px solid #4fffa4; border-right: 2px solid #4fffa4; }

        /* Border */
        .cert-border {
          position: absolute;
          top: 12px; left: 12px; right: 12px; bottom: 12px;
          border: 1px solid rgba(79,255,164,0.1);
          pointer-events: none;
          z-index: 2;
        }

        /* Background watermark shield */
        .bg-watermark {
          position: absolute;
          top: -80px; right: -100px;
          width: 500px; height: 500px;
          opacity: 0.04;
          z-index: 0;
          pointer-events: none;
        }

        /* Green corner glows matching the original */
        .glow-bl {
          position: absolute; bottom: 0; left: 0; width: 300px; height: 300px;
          background: radial-gradient(circle at 0% 100%, rgba(20,80,40,0.5) 0%, rgba(10,50,25,0.2) 40%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .glow-br {
          position: absolute; bottom: 0; right: 0; width: 250px; height: 250px;
          background: radial-gradient(circle at 100% 100%, rgba(15,70,35,0.4) 0%, rgba(10,50,25,0.15) 40%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .glow-top {
          position: absolute; top: 0; right: 0; width: 450px; height: 400px;
          background: radial-gradient(ellipse at 80% 15%, rgba(20,60,30,0.35) 0%, rgba(10,40,20,0.1) 40%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .glow-left {
          position: absolute; top: 0; left: 0; width: 100px; height: 100%;
          background: linear-gradient(90deg, rgba(15,60,30,0.15) 0%, transparent 100%);
          z-index: 0; pointer-events: none;
        }

        .cert-inner { position: relative; z-index: 1; padding: 36px 52px; }

        /* Logo */
        .logo-wrap { text-align: center; margin-bottom: 14px; }

        /* Title */
        .eyebrow {
          text-align: center; font-size: 10px; letter-spacing: 0.3em;
          color: #7a8a9e; font-family: 'IBM Plex Mono', monospace; margin-bottom: 4px;
        }
        .cert-title { text-align: center; font-size: 30px; font-weight: 800; line-height: 1.15; margin-bottom: 12px; }
        .cert-title .accent { color: #4fffa4; }
        .cert-sub { text-align: center; font-size: 11.5px; color: #7a8a9e; margin-bottom: 20px; line-height: 1.6; }

        /* Project */
        .project-section { text-align: center; margin-bottom: 20px; }
        .project-logo { height: 52px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
        .project-name { font-size: 26px; font-weight: 800; color: #4fffa4; }

        /* Info card */
        .info-card {
          background: rgba(13,17,32,0.85);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 18px 22px;
          margin-bottom: 14px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 36px;
        }
        .info-label {
          font-size: 8.5px; letter-spacing: 0.18em; text-transform: uppercase;
          color: #7a8a9e; font-family: 'IBM Plex Mono', monospace; margin-bottom: 2px;
        }
        .info-value { font-size: 11.5px; font-weight: 500; line-height: 1.4; color: #e8edf5; }
        .info-value-green { font-size: 11.5px; font-weight: 600; color: #4fffa4; font-family: 'IBM Plex Mono', monospace; }
        .info-value-sm { font-size: 9.5px; font-weight: 400; line-height: 1.4; color: #e8edf5; word-break: break-all; }

        /* Findings */
        .findings-card {
          background: rgba(13,17,32,0.85);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px 22px 18px;
          margin-bottom: 14px;
          text-align: center;
        }
        .findings-title {
          font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #7a8a9e; font-family: 'IBM Plex Mono', monospace; margin-bottom: 12px;
        }
        .findings-row { display: flex; justify-content: center; gap: 8px; }
        .finding-box { width: 98px; border-radius: 8px; padding: 10px 0 8px; text-align: center; }
        .finding-num { font-size: 28px; font-weight: 800; color: #fff; display: block; line-height: 1.1; }
        .finding-lbl { font-size: 7.5px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.5); font-family: 'IBM Plex Mono', monospace; }
        .sev-critical { background: linear-gradient(180deg, rgba(255,79,106,0.18) 0%, rgba(255,79,106,0.06) 100%); border: 1px solid rgba(255,79,106,0.25); }
        .sev-high { background: linear-gradient(180deg, rgba(255,159,67,0.18) 0%, rgba(255,159,67,0.06) 100%); border: 1px solid rgba(255,159,67,0.25); }
        .sev-medium { background: linear-gradient(180deg, rgba(255,217,61,0.18) 0%, rgba(255,217,61,0.06) 100%); border: 1px solid rgba(255,217,61,0.25); }
        .sev-low { background: linear-gradient(180deg, rgba(79,163,255,0.18) 0%, rgba(79,163,255,0.06) 100%); border: 1px solid rgba(79,163,255,0.25); }
        .sev-info { background: linear-gradient(180deg, rgba(79,255,213,0.18) 0%, rgba(79,255,213,0.06) 100%); border: 1px solid rgba(79,255,213,0.25); }
        .sev-gas { background: linear-gradient(180deg, rgba(122,138,158,0.18) 0%, rgba(122,138,158,0.06) 100%); border: 1px solid rgba(122,138,158,0.25); }

        /* Resolved banner */
        .resolved-banner {
          background: rgba(79,255,164,0.05);
          border: 1px solid rgba(79,255,164,0.15);
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          font-size: 11px; font-weight: 700;
          color: #4fffa4; letter-spacing: 0.04em;
          margin-bottom: 12px;
        }

        /* Body text */
        .cert-body { font-size: 9.5px; color: #7a8a9e; line-height: 1.7; margin-bottom: 18px; }

        /* Footer */
        .cert-footer { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 14px; }
        .qr-section { text-align: center; flex-shrink: 0; }
        .qr-section img { width: 80px; height: 80px; }
        .qr-label { font-size: 7px; color: #7a8a9e; font-family: 'IBM Plex Mono', monospace; margin-top: 3px; line-height: 1.4; }
        .footer-meta { flex: 1; }
        .footer-meta .info-label { margin-top: 6px; }
        .footer-meta .info-value { font-size: 11px; }

        .badges-section {
          display: flex; align-items: center; gap: 14px;
          margin-left: auto; flex-shrink: 0;
        }
        .badge-group { text-align: center; }
        .badge-circle {
          width: 42px; height: 42px; border-radius: 50%;
          border: 1.5px solid #4fa3ff; background: rgba(79,163,255,0.06);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          margin: 0 auto 4px;
        }
        .badge-circle span:first-child { font-size: 7px; font-weight: 700; color: #4fa3ff; }
        .badge-circle span:last-child { font-size: 5.5px; color: #4fa3ff; }
        .owasp-text { font-size: 11px; font-weight: 800; color: #e8edf5; }
        .owasp-sub { font-size: 6.5px; color: #7a8a9e; line-height: 1.3; }

        .audited-by { text-align: center; }
        .audited-by-label { font-size: 7.5px; color: #7a8a9e; margin-bottom: 2px; }
        .audited-by-logo { display: flex; align-items: center; gap: 4px; justify-content: center; }

        /* Bottom bar */
        .bottom-bar {
          background: rgba(13,17,32,0.85);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 7px 20px;
          text-align: center;
          font-size: 8.5px;
          color: #7a8a9e;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em;
        }

        .divider { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin: 0 0 14px; }
      ` }} />

      <div className="cert">
        {/* Decorative elements */}
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>
        <div className="cert-border"></div>
        {/* Background watermark shield */}
        <svg className="bg-watermark" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 5L190 50v100l-90 55L10 150V50L100 5z" stroke="#4fffa4" strokeWidth="8" fill="none"/>
          <path d="M100 30L170 62v80l-70 42L30 142V62L100 30z" stroke="#4fffa4" strokeWidth="6" fill="none"/>
          <path d="M100 55L150 78v60l-50 30L50 138V78L100 55z" stroke="#4fffa4" strokeWidth="5" fill="none"/>
          <path d="M100 78L132 92v40l-32 19L68 132V92L100 78z" stroke="#4fffa4" strokeWidth="4" fill="none"/>
          <path d="M85 120L100 105l15 15-15 15-15-15z" stroke="#4fffa4" strokeWidth="3" fill="none" transform="rotate(-10 100 115)"/>
        </svg>
        <div className="glow-bl"></div>
        <div className="glow-br"></div>
        <div className="glow-top"></div>
        <div className="glow-left"></div>

        <div className="cert-inner">

          {/* CredShields Logo */}
          <div className="logo-wrap">
            <svg width="130" height="48" viewBox="0 0 130 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 3L43 13.5v21L24 45 5 34.5v-21L24 3z" stroke="#4fffa4" strokeWidth="2" fill="none"/>
              <path d="M24 10l13 7.5v15L24 40 11 32.5v-15L24 10z" fill="#4fffa4" fillOpacity="0.12" stroke="#4fffa4" strokeWidth="0.5"/>
              <path d="M24 17l6 3.5v7L24 31l-6-3.5v-7L24 17z" fill="#4fffa4" fillOpacity="0.2"/>
              <text x="78" y="22" fill="#e8edf5" fontSize="15" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="1">CRED</text>
              <text x="78" y="40" fill="#e8edf5" fontSize="15" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="1">SHIELDS</text>
            </svg>
          </div>

          {/* Title */}
          <div className="eyebrow">— SMART CONTRACT SECURITY ASSESSMENT —</div>
          <h1 className="cert-title">CERTIFICATE <span className="accent">OF AUDIT</span></h1>
          <p className="cert-sub">
            This is to certify that CredShields Technologies PTE. LTD. has completed a<br/>
            comprehensive Smart Contract Security Audit for the following project:
          </p>

          {/* Project Logo & Name */}
          <div className="project-section">
            {cert.project_logo && <img className="project-logo" src={cert.project_logo} alt={cert.project_name} />}
            <div className="project-name">{cert.project_name}</div>
          </div>

          {/* Info Grid */}
          <div className="info-card">
            <div className="info-grid">
              <div><div className="info-label">Certificate ID</div><div className="info-value-green">{cid}</div></div>
              <div><div className="info-label">Audit Period</div><div className="info-value">{cert.audit_period}</div></div>
              <div><div className="info-label">Audit Firm</div><div className="info-value">CredShields Technologies PTE. LTD.</div></div>
              <div><div className="info-label">Retest Date</div><div className="info-value">{cert.retest_date || '—'}</div></div>
              <div><div className="info-label">Lead Auditor</div><div className="info-value">{cert.lead_auditor}</div></div>
              <div><div className="info-label">Report Version</div><div className="info-value">{cert.report_version}</div></div>
              <div><div className="info-label">Audited Contract</div><div className="info-value">{cert.audited_contract || '—'}</div></div>
              <div><div className="info-label">Network</div><div className="info-value">{cert.network || '—'}</div></div>
              <div><div className="info-label">Contract — Audited</div><div className="info-value-sm">{cert.contract_audited || '—'}</div></div>
              <div><div className="info-label">Contract — Retested</div><div className="info-value-sm">{cert.contract_retested || '—'}</div></div>
              <div><div className="info-label">OWASP Framework</div><div className="info-value">{cert.owasp_framework}</div></div>
              <div><div className="info-label">Methodology</div><div className="info-value">{cert.methodology}</div></div>
            </div>
          </div>

          {/* Findings Summary */}
          <div className="findings-card">
            <div className="findings-title">Findings Summary</div>
            <div className="findings-row">
              <div className="finding-box sev-critical"><span className="finding-num">{cert.critical}</span><span className="finding-lbl">Critical</span></div>
              <div className="finding-box sev-high"><span className="finding-num">{cert.high}</span><span className="finding-lbl">High</span></div>
              <div className="finding-box sev-medium"><span className="finding-num">{cert.medium}</span><span className="finding-lbl">Medium</span></div>
              <div className="finding-box sev-low"><span className="finding-num">{cert.low}</span><span className="finding-lbl">Low</span></div>
              <div className="finding-box sev-info"><span className="finding-num">{cert.info}</span><span className="finding-lbl">Info</span></div>
              <div className="finding-box sev-gas"><span className="finding-num">{cert.gas}</span><span className="finding-lbl">Gas</span></div>
            </div>
          </div>

          {/* Resolved Banner */}
          <div className="resolved-banner">
            &#10003;&nbsp; ALL CRITICAL AND HIGH SEVERITY ISSUES RESOLVED &nbsp;&#10003;
          </div>

          {/* Body Text */}
          <p className="cert-body">
            This certificate attests that CredShields Technologies PTE. LTD. performed a thorough security assessment of the {cert.project_name} smart contract during {cert.audit_period}, identifying {totalFindings} vulnerabilities across Critical, High, Medium, Low, Informational, and Gas categories. A formal retest was conducted on {cert.retest_date || 'N/A'}, confirming remediation of all fixed issues. Two findings were acknowledged by the client as intentional design choices. This report was prepared using the OWASP Smart Contract Security Verification Standard (SCSVS), the Smart Contract Weakness Enumeration (SCWE), and the Smart Contract Secure Testing Guide (SCSTG).
          </p>

          <div className="divider"></div>

          {/* Footer */}
          <div className="cert-footer">
            <div className="qr-section">
              <img src={qrDataUrl} alt="QR Code" />
              <div className="qr-label">
                Scan to verify<br/>
                credshields.com/verify/<br/>
                {cid.toLowerCase()}
              </div>
            </div>
            <div className="footer-meta">
              <div className="info-label">Certificate ID</div>
              <div className="info-value-green">{cid}</div>
              <div className="info-label">Issued</div>
              <div className="info-value">{cert.issue_date}</div>
              <div className="info-label">Issued By</div>
              <div className="info-value">CredShields Technologies PTE. LTD.</div>
            </div>
            <div className="badges-section">
              <div className="badge-group">
                <div className="badge-circle"><span>AICPA</span><span>SOC</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                  <span style={{ fontSize: 3, color: '#7a8a9e' }}>|</span>
                  <span className="owasp-text">OWASP</span>
                </div>
                <div className="owasp-sub">Smart Contract Top 10<br/>Security Risks &amp; Vulnerabilities</div>
              </div>
              <div className="audited-by">
                <div className="audited-by-label">Audited by</div>
                <svg width="72" height="32" viewBox="0 0 72 32" fill="none">
                  <path d="M16 2L28 9v14L16 30 4 23V9L16 2z" stroke="#4fffa4" strokeWidth="1.2" fill="none"/>
                  <path d="M16 7l8 4.5v9L16 25 8 20.5v-9L16 7z" fill="#4fffa4" fillOpacity="0.1"/>
                  <text x="44" y="14" fill="#e8edf5" fontSize="8" fontWeight="800" fontFamily="Inter">CRED</text>
                  <text x="44" y="24" fill="#e8edf5" fontSize="8" fontWeight="800" fontFamily="Inter">SHIELDS</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bottom-bar">
            Certificate ID: {cid} &nbsp;&middot;&nbsp; Issued: {cert.issue_date} &nbsp;&middot;&nbsp; credshields.com
          </div>

        </div>
      </div>
    </>
  )
}
