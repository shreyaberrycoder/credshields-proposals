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
  const { data: cert, error } = await db().from('certificates').select('*').eq('id', certId).single()
  if (error || !cert) notFound()

  const cid = certIdStr(cert.cert_number)
  const verifyUrl = `https://credshields.com/verify/${cid.toLowerCase()}`
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 120, margin: 1,
    color: { dark: '#39ff14', light: '#00000000' },
  })
  const totalFindings = cert.critical + cert.high + cert.medium + cert.low + cert.info + cert.gas

  return (
    <>
      <title>{`${cert.project_name} | Audit Certificate`}</title>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&family=Share+Tech+Mono&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a1a0a; color: #e0f0e0; font-family: 'Barlow', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print { body { background: #0a1a0a !important; } @page { size: 794px 1123px; margin: 0; } }

        .cert-screen {
          width: 794px; min-height: 1123px; margin: 0 auto;
          background: #0a1a0a; position: relative; overflow: hidden;
        }

        /* Grid texture */
        .grid-texture {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background:
            linear-gradient(180deg, rgba(57,255,20,0.07) 3%, rgba(57,255,20,0) 3%),
            linear-gradient(90deg, rgba(57,255,20,0.07) 3%, rgba(57,255,20,0) 3%);
          background-size: 20px 20px;
          z-index: 0;
        }

        /* Outer decorative border */
        .deco-border {
          position: absolute; top: 14px; left: 14px;
          width: calc(100% - 28px); height: calc(100% - 28px);
          border: 1px solid #1e4d1e; border-radius: 10px;
          z-index: 1; pointer-events: none;
        }

        /* Inner green border */
        .inner-border {
          position: absolute; top: 22px; left: 22px;
          width: calc(100% - 44px); height: calc(100% - 44px);
          border: 1px solid #5ee832; border-radius: 8px;
          z-index: 1; pointer-events: none;
        }

        /* Corner brackets */
        .corner { position: absolute; z-index: 2; }
        .corner-tl { top: 18px; left: 18px; }
        .corner-tl::before { content: ''; position: absolute; top: 0; left: 0; width: 38px; height: 2px; background: #39ff14; }
        .corner-tl::after { content: ''; position: absolute; top: 0; left: 0; width: 2px; height: 38px; background: #39ff14; }
        .corner-br { bottom: 18px; right: 18px; }
        .corner-br::before { content: ''; position: absolute; bottom: 0; right: 0; width: 38px; height: 2px; background: #39ff14; }
        .corner-br::after { content: ''; position: absolute; bottom: 0; right: 0; width: 2px; height: 38px; background: #39ff14; }

        /* Page content area */
        .page {
          position: relative; z-index: 1;
          margin: 23px; background: #030a06; border-radius: 7px;
          overflow: hidden; padding: 40px 35px 20px;
          min-height: 1077px;
        }

        /* Background gradient glow */
        .page::before {
          content: ''; position: absolute; top: -100px; right: -100px;
          width: 500px; height: 500px; opacity: 0.08;
          background: radial-gradient(circle, #39ff14 0%, transparent 70%);
          z-index: 0; pointer-events: none;
        }
        .page > * { position: relative; z-index: 1; }

        /* Header */
        .logo-wrap { text-align: center; margin-bottom: 16px; }
        .logo-wrap img { height: 40px; }

        .eyebrow {
          text-align: center; font-family: 'Share Tech Mono', monospace;
          font-size: 8px; letter-spacing: 1.76px; color: #39ff14; margin-bottom: 6px;
        }
        .cert-title {
          text-align: center; font-size: 28px; font-weight: 800; line-height: 1.1;
          letter-spacing: -0.5px; margin-bottom: 14px;
        }
        .cert-title .white { color: #ffffff; }
        .cert-title .green { color: #39ff14; }

        .cert-sub {
          text-align: center; font-size: 10px; color: #b0c4b0;
          font-weight: 300; line-height: 17px; margin-bottom: 16px;
        }

        /* Project */
        .project-section { text-align: center; margin-bottom: 16px; }
        .project-logo { height: 44px; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto; }
        .project-name {
          font-size: 26px; font-weight: 800; color: #39ff14;
          letter-spacing: -0.26px; text-align: center;
        }

        /* Info panel */
        .info-panel {
          background: rgba(10,26,10,0.6); border: 1px solid #1e4d1e;
          border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;
        }
        .info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
        }
        .info-row {
          display: flex; flex-direction: column; padding: 8px 0;
          border-bottom: 1px solid rgba(30,77,30,0.5);
        }
        .info-row:nth-child(odd) { padding-right: 16px; }
        .info-row:nth-child(even) { padding-left: 16px; border-left: 1px solid rgba(30,77,30,0.3); }
        .info-label {
          font-family: 'Share Tech Mono', monospace; font-size: 7px;
          letter-spacing: 0.98px; color: #5a7a5a; margin-bottom: 2px;
        }
        .info-value { font-size: 10px; font-weight: 500; color: #e0f0e0; line-height: 1.4; }
        .info-value-green {
          font-size: 10px; font-weight: 600; color: #39ff14;
          font-family: 'Share Tech Mono', monospace;
        }
        .info-value-sm { font-size: 8.5px; font-weight: 400; color: #e0f0e0; word-break: break-all; line-height: 1.4; }

        /* Divider */
        .divider { width: 100%; height: 1px; background: #1e4d1e; margin: 10px 0; }

        /* Findings */
        .findings-title {
          text-align: center; font-family: 'Share Tech Mono', monospace;
          font-size: 8px; letter-spacing: 1.5px; color: #5a7a5a; margin-bottom: 10px;
        }
        .findings-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 12px; }
        .finding-box {
          width: 96px; border-radius: 6px; padding: 8px 0 6px;
          text-align: center; border: 1px solid;
        }
        .finding-num { font-size: 24px; font-weight: 800; color: #fff; display: block; line-height: 1.1; }
        .finding-lbl {
          font-family: 'Share Tech Mono', monospace; font-size: 7px;
          letter-spacing: 0.5px; color: rgba(255,255,255,0.5);
        }
        .sev-critical { background: rgba(255,50,50,0.12); border-color: rgba(255,50,50,0.3); }
        .sev-high { background: rgba(255,140,50,0.12); border-color: rgba(255,140,50,0.3); }
        .sev-medium { background: rgba(255,200,50,0.12); border-color: rgba(255,200,50,0.3); }
        .sev-low { background: rgba(50,150,255,0.12); border-color: rgba(50,150,255,0.3); }
        .sev-info { background: rgba(50,255,180,0.12); border-color: rgba(50,255,180,0.3); }
        .sev-gas { background: rgba(120,150,120,0.12); border-color: rgba(120,150,120,0.3); }

        /* Status ribbon */
        .status-ribbon {
          background: rgba(57,255,20,0.06); border: 1px solid rgba(57,255,20,0.2);
          border-radius: 6px; padding: 8px; text-align: center;
          font-size: 10px; font-weight: 700; color: #39ff14;
          letter-spacing: 0.5px; margin-bottom: 12px;
        }

        /* Validity text */
        .validity-text {
          font-size: 9px; color: #b0c4b0; line-height: 1.7;
          font-weight: 300; margin-bottom: 14px;
        }

        /* Bottom divider */
        .bottom-line { width: 100%; height: 1px; background: #1e4d1e; margin-bottom: 12px; }

        /* Footer section */
        .cert-footer { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
        .qr-section { flex-shrink: 0; text-align: center; }
        .qr-border {
          background: #0d2210; border: 1px solid #39ff14; border-radius: 6px;
          padding: 6px; width: 80px; height: 80px;
          display: flex; align-items: center; justify-content: center;
        }
        .qr-border img { width: 58px; height: 58px; }
        .qr-label {
          font-family: 'Share Tech Mono', monospace; font-size: 6px;
          color: #5a7a5a; margin-top: 4px; line-height: 1.4;
        }
        .qr-verify-url {
          font-family: 'Share Tech Mono', monospace; font-size: 5.5px;
          color: #39ff14; opacity: 0.7; margin-top: 1px;
        }

        .footer-meta { flex: 1; }
        .footer-meta .info-label { margin-top: 6px; }
        .footer-meta .info-value-green { font-size: 8.5px; }
        .footer-meta .info-value { font-size: 9.5px; }

        .badges-section { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; }
        .badge-circle {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid #4fa3ff; background: rgba(79,163,255,0.06);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .badge-circle span:first-child { font-size: 6px; font-weight: 700; color: #4fa3ff; }
        .badge-circle span:last-child { font-size: 5px; color: #4fa3ff; }
        .badge-owasp { font-size: 10px; font-weight: 800; color: #e0f0e0; }
        .badge-owasp-sub { font-size: 6px; color: #5a7a5a; line-height: 1.3; }
        .audited-by-label { font-size: 7px; color: #5a7a5a; margin-bottom: 2px; }

        /* Footer bar */
        .footer-line { width: 100%; height: 1px; background: rgba(57,255,20,0.5); margin-bottom: 8px; }
        .footer-bar {
          text-align: center; font-family: 'Share Tech Mono', monospace;
          font-size: 6.5px; color: #5a7a5a; letter-spacing: 0.65px;
        }
      ` }} />

      <div className="cert-screen">
        <div className="grid-texture"></div>
        <div className="deco-border"></div>
        <div className="inner-border"></div>
        <div className="corner corner-tl"></div>
        <div className="corner corner-br"></div>

        <div className="page">
          {/* Logo */}
          <div className="logo-wrap">
            <img src="/credshields-logo-white.png" alt="CredShields" />
          </div>

          {/* Title */}
          <div className="eyebrow">SMART CONTRACT SECURITY ASSESSMENT</div>
          <h1 className="cert-title">
            <span className="white">CERTIFICATE</span>{' '}
            <span className="green">OF AUDIT</span>
          </h1>
          <p className="cert-sub">
            This is to certify that CredShields Technologies PTE. LTD. has completed a<br/>
            comprehensive Smart Contract Security Audit for the following project:
          </p>

          {/* Project */}
          <div className="project-section">
            {cert.project_logo && <img className="project-logo" src={cert.project_logo} alt={cert.project_name} />}
            <div className="project-name">{cert.project_name}</div>
          </div>

          {/* Info Panel */}
          <div className="info-panel">
            <div className="info-grid">
              <div className="info-row"><div className="info-label">CERTIFICATE ID</div><div className="info-value-green">{cid}</div></div>
              <div className="info-row"><div className="info-label">AUDIT PERIOD</div><div className="info-value">{cert.audit_period}</div></div>
              <div className="info-row"><div className="info-label">AUDIT FIRM</div><div className="info-value">CredShields Technologies PTE. LTD.</div></div>
              <div className="info-row"><div className="info-label">RETEST DATE</div><div className="info-value">{cert.retest_date || 'N/A'}</div></div>
              <div className="info-row"><div className="info-label">LEAD AUDITOR</div><div className="info-value">{cert.lead_auditor}</div></div>
              <div className="info-row"><div className="info-label">REPORT VERSION</div><div className="info-value">{cert.report_version}</div></div>
              <div className="info-row"><div className="info-label">AUDITED CONTRACT</div><div className="info-value">{cert.audited_contract || 'N/A'}</div></div>
              <div className="info-row"><div className="info-label">NETWORK</div><div className="info-value">{cert.network || 'N/A'}</div></div>
              <div className="info-row"><div className="info-label">CONTRACT &mdash; AUDITED</div><div className="info-value-sm">{cert.contract_audited || 'N/A'}</div></div>
              <div className="info-row"><div className="info-label">CONTRACT &mdash; RETESTED</div><div className="info-value-sm">{cert.contract_retested || 'N/A'}</div></div>
              <div className="info-row"><div className="info-label">OWASP FRAMEWORK</div><div className="info-value">{cert.owasp_framework}</div></div>
              <div className="info-row"><div className="info-label">METHODOLOGY</div><div className="info-value">{cert.methodology}</div></div>
            </div>

            <div className="divider"></div>

            {/* Findings */}
            <div className="findings-title">FINDINGS SUMMARY</div>
            <div className="findings-row">
              <div className="finding-box sev-critical"><span className="finding-num">{cert.critical}</span><span className="finding-lbl">CRITICAL</span></div>
              <div className="finding-box sev-high"><span className="finding-num">{cert.high}</span><span className="finding-lbl">HIGH</span></div>
              <div className="finding-box sev-medium"><span className="finding-num">{cert.medium}</span><span className="finding-lbl">MEDIUM</span></div>
              <div className="finding-box sev-low"><span className="finding-num">{cert.low}</span><span className="finding-lbl">LOW</span></div>
              <div className="finding-box sev-info"><span className="finding-num">{cert.info}</span><span className="finding-lbl">INFO</span></div>
              <div className="finding-box sev-gas"><span className="finding-num">{cert.gas}</span><span className="finding-lbl">GAS</span></div>
            </div>
          </div>

          {/* Status Ribbon */}
          <div className="status-ribbon">
            &#10003;&nbsp; ALL CRITICAL AND HIGH SEVERITY ISSUES RESOLVED &nbsp;&#10003;
          </div>

          {/* Validity Text */}
          <p className="validity-text">
            This certificate attests that CredShields Technologies PTE. LTD. performed a thorough security assessment of the {cert.project_name} smart contract during {cert.audit_period}, identifying {totalFindings} vulnerabilities across Critical, High, Medium, Low, Informational, and Gas categories. A formal retest was conducted on {cert.retest_date || 'N/A'}, confirming remediation of all fixed issues. Two findings were acknowledged by the client as intentional design choices. This report was prepared using the OWASP Smart Contract Security Verification Standard (SCSVS), the Smart Contract Weakness Enumeration (SCWE), and the Smart Contract Secure Testing Guide (SCSTG).
          </p>

          {/* Bottom Section */}
          <div className="bottom-line"></div>

          <div className="cert-footer">
            <div className="qr-section">
              <div className="qr-border"><img src={qrDataUrl} alt="QR Code" /></div>
              <div className="qr-label">Scan to verify</div>
              <div className="qr-verify-url">credshields.com/verify/<br/>{cid.toLowerCase()}</div>
            </div>

            <div className="footer-meta">
              <div className="info-label">CERTIFICATE ID</div>
              <div className="info-value-green">{cid}</div>
              <div className="info-label">ISSUED</div>
              <div className="info-value">{cert.issue_date}</div>
              <div className="info-label">ISSUED BY</div>
              <div className="info-value">CredShields Technologies PTE. LTD.</div>
            </div>

            <div className="badges-section">
              <img src="/cert-badges.png" alt="AICPA SOC | OWASP | Audited by CredShields" style={{ height: 95 }} />
            </div>
          </div>

          {/* Footer Bar */}
          <div className="footer-line"></div>
          <div className="footer-bar">
            Certificate ID: {cid} &nbsp;&middot;&nbsp; Issued: {cert.issue_date} &nbsp;&middot;&nbsp; credshields.com
          </div>
        </div>
      </div>
    </>
  )
}
