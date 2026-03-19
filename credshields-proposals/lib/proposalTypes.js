export const PROPOSAL_TYPES = {
  smart_contract: {
    label:    'Smart Contract Audit Proposal',
    eyebrow:  'Smart Contract Audit Proposal',
    urgency:  '$3.6B+ was lost to exploits in 2025. An audit at this stage is the highest-ROI security investment your protocol will ever make.',
    coverage: 'Our audit covers 13 vulnerability categories including reentrancy, flash loan exploits, oracle manipulation, access control flaws, and economic attack surfaces mapped to the OWASP Smart Contract Top 10 standard which our team helped draft.',
    methodology: [
      { icon:'🔍', title:'Manual Review',      desc:'Every line inspected for logic flaws, access control issues, economic attack vectors, and protocol-level risks automation cannot catch.' },
      { icon:'🤖', title:'SolidityScan AI',    desc:'Our engine cross-references 60,000+ known vulnerabilities across 1,000+ rules. Every finding is manually validated before it reaches your report.' },
      { icon:'💣', title:'Exploit Simulation', desc:'We write PoC exploit code to prove exploitability. You get reproduction steps, logs, and screenshots for every critical finding.' },
      { icon:'🔁', title:'Retest & Regression',desc:'After your team applies fixes, we re-run the full test suite, check for newly introduced issues, and validate overall security posture.' },
    ],
    competitors: [
      { name:'Hacken',        mult:[2, 3.5],  days:'2-3 weeks',  retest:'Paid extra', seal:'✗', owasp:'✓',        support:'Ticket' },
      { name:'CertiK',        mult:[2.5, 6],  days:'2-4 weeks',  retest:'Limited',    seal:'✗', owasp:'✓',        support:'Ticket' },
      { name:'Trail of Bits', mult:[7.5, 10], days:'4-8 weeks',  retest:'Paid extra', seal:'✗', owasp:'Partial',  support:'Email'  },
    ],
  },
  web_app: {
    label:    'Web Application Audit Proposal',
    eyebrow:  'Web Application Audit Proposal',
    urgency:  '$4.5B+ was lost to web application breaches in 2025. A professional security audit is the most important investment you can make before launch.',
    coverage: 'Our audit covers the OWASP Web Application Top 10 including SQL injection, XSS, broken authentication, IDOR, SSRF, security misconfigurations, and business logic flaws across your entire attack surface.',
    methodology: [
      { icon:'🔍', title:'Manual Penetration Testing', desc:'Our engineers simulate real attacker techniques — authenticated and unauthenticated — across your entire application surface.' },
      { icon:'🤖', title:'Automated DAST/SAST',        desc:'Dynamic and static analysis tools scan your codebase and running application simultaneously, catching both code-level and runtime vulnerabilities.' },
      { icon:'💣', title:'Business Logic Review',      desc:'We test for flaws in your application logic — broken workflows, privilege escalation, and access control bypasses that automated tools miss.' },
      { icon:'🔁', title:'Retest & Regression',        desc:'After remediation, we re-verify every finding, run regression tests, and confirm no new vulnerabilities were introduced during fixes.' },
    ],
    competitors: [
      { name:'Synack',     mult:[2, 4],   days:'2-4 weeks',  retest:'Paid extra', seal:'✗', owasp:'✓',       support:'Portal'  },
      { name:'HackerOne',  mult:[3, 6],   days:'3-6 weeks',  retest:'Limited',    seal:'✗', owasp:'✓',       support:'Ticket'  },
      { name:'NCC Group',  mult:[6, 12],  days:'4-8 weeks',  retest:'Paid extra', seal:'✗', owasp:'Partial', support:'Email'   },
    ],
  },
  mobile: {
    label:    'Mobile Application Audit Proposal',
    eyebrow:  'Mobile Application Audit Proposal',
    urgency:  'Mobile apps are the fastest growing attack vector in 2025. A single vulnerability in your app can expose millions of users.',
    coverage: 'Our audit covers OWASP Mobile Top 10 including insecure data storage, weak authentication, improper session handling, reverse engineering exposure, and insecure communication across iOS and Android.',
    methodology: [
      { icon:'🔍', title:'Static Analysis (SAST)',     desc:'We decompile and reverse-engineer your app binaries to find hardcoded secrets, insecure APIs, and vulnerable third-party libraries.' },
      { icon:'🤖', title:'Dynamic Analysis (DAST)',    desc:'Runtime testing with instrumented devices captures real-time traffic, API calls, and data flows to identify live vulnerabilities.' },
      { icon:'💣', title:'API & Backend Testing',      desc:'We test the mobile backend APIs for authentication flaws, IDOR, injection attacks, and rate limiting bypass.' },
      { icon:'🔁', title:'Retest & Regression',        desc:'After remediation, we re-verify every finding on both iOS and Android builds and confirm full resolution.' },
    ],
    competitors: [
      { name:'NowSecure',  mult:[2, 4],  days:'2-3 weeks', retest:'Paid extra', seal:'✗', owasp:'✓',       support:'Portal' },
      { name:'Zimperium',  mult:[3, 5],  days:'3-4 weeks', retest:'Limited',    seal:'✗', owasp:'✓',       support:'Ticket' },
      { name:'IOActive',   mult:[6, 10], days:'4-8 weeks', retest:'Paid extra', seal:'✗', owasp:'Partial', support:'Email'  },
    ],
  },
  traditional: {
    label:    'Security Audit Proposal',
    eyebrow:  'Security Audit Proposal',
    urgency:  'The average cost of a data breach in 2025 was $4.9M. A comprehensive security audit is the most cost-effective protection you can invest in.',
    coverage: 'Our audit covers network security, infrastructure hardening, access control policies, cloud configuration review, vulnerability assessment, and compliance mapping to ISO 27001, SOC 2, and NIST frameworks.',
    methodology: [
      { icon:'🔍', title:'Infrastructure Review',  desc:'Comprehensive assessment of your network architecture, firewall rules, segmentation, and exposed services.' },
      { icon:'🤖', title:'Vulnerability Scanning', desc:'Automated and manual vulnerability assessment across all systems, services, and endpoints in scope.' },
      { icon:'💣', title:'Penetration Testing',    desc:'Simulated real-world attack scenarios to validate exploitability and measure your actual security posture.' },
      { icon:'🔁', title:'Remediation & Retest',   desc:'Detailed remediation guidance, fix verification, and a clean final report ready for compliance and auditors.' },
    ],
    competitors: [
      { name:'Deloitte', mult:[5, 10],  days:'4-8 weeks',  retest:'Paid extra', seal:'✗', owasp:'Partial', support:'Email'  },
      { name:'KPMG',     mult:[6, 12],  days:'6-10 weeks', retest:'Paid extra', seal:'✗', owasp:'Partial', support:'Email'  },
      { name:'PwC',      mult:[8, 15],  days:'8-12 weeks', retest:'Paid extra', seal:'✗', owasp:'Partial', support:'Email'  },
    ],
  },
}

export const TYPE_LABELS = {
  smart_contract: 'Smart Contract Audit',
  web_app:        'Web Application Audit',
  mobile:         'Mobile Application Audit',
  traditional:    'Security Audit',
}

export const DEFAULT_TIMELINES = {
  smart_contract: [
    { day:'Day 1',   title:'Scope & Kickoff',         desc:'Align on objectives, contracts in scope, and timeline. Repo access granted. Slot locked with 50% deposit.' },
    { day:'Day 2-3', title:'Manual + AI Review',      desc:'Line-by-line manual review combined with SolidityScan AI engine. All findings cross-validated by senior auditors.' },
    { day:'Day 4',   title:'Draft Report Delivered',  desc:'All findings with severity ratings, exploit scenarios, and fix recommendations. Readable by devs and investors.' },
    { day:'Day 5',   title:'Your Team Applies Fixes', desc:'We are on Telegram/Discord to answer questions and review proposed solutions during remediation.' },
    { day:'Day 6',   title:'Retest + Certification',  desc:'We verify every fix, check for new issues, and issue your public audit report, security badge, and on-chain seal.' },
  ],
  web_app: [
    { day:'Day 1',   title:'Scope & Kickoff',           desc:'Align on application scope, test environment access, and testing rules of engagement.' },
    { day:'Day 2-3', title:'Automated Scanning',        desc:'DAST and SAST tools run across your application and codebase. All findings logged and triaged.' },
    { day:'Day 4-5', title:'Manual Penetration Testing',desc:'Our engineers manually probe your application for logic flaws, access control bypasses, and complex vulnerabilities.' },
    { day:'Day 6',   title:'Draft Report Delivered',    desc:'Full findings with CVSS scores, proof-of-concept steps, and fix recommendations.' },
    { day:'Day 7',   title:'Retest + Certification',    desc:'We verify every fix and issue your final security report and certification.' },
  ],
  mobile: [
    { day:'Day 1',   title:'Scope & Kickoff',       desc:'Receive app builds (iOS/Android), align on scope, set up testing devices and environment.' },
    { day:'Day 2-3', title:'Static Analysis',       desc:'Reverse engineer app binaries, inspect source, check for secrets, and map third-party dependencies.' },
    { day:'Day 4',   title:'Dynamic Analysis',      desc:'Runtime testing on instrumented devices. API traffic interception, data flow analysis, and live exploit attempts.' },
    { day:'Day 5',   title:'Draft Report',          desc:'Full findings with severity ratings, reproduction steps, and developer-friendly fix guidance.' },
    { day:'Day 6',   title:'Retest + Certification',desc:'Verify all fixes on both iOS and Android builds and issue final certification.' },
  ],
  traditional: [
    { day:'Day 1',   title:'Scope & Kickoff',           desc:'Define scope, obtain necessary credentials and network access, align on testing windows.' },
    { day:'Day 2-3', title:'Vulnerability Assessment',  desc:'Automated scanning across all in-scope systems, services, and endpoints.' },
    { day:'Day 4-5', title:'Penetration Testing',       desc:'Manual exploitation attempts to validate vulnerabilities and assess real-world impact.' },
    { day:'Day 6',   title:'Draft Report',              desc:'Full findings with risk ratings, business impact analysis, and remediation roadmap.' },
    { day:'Day 7',   title:'Retest + Final Report',     desc:'Verify all remediations and issue final security report ready for compliance.' },
  ],
}
