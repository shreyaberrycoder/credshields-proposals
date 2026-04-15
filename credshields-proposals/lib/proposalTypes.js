// ─── PROPOSAL TYPES ─────────────────────────────────────────────────────────
// Every type exports:
//   label, methodology[], competitors(price)[], vulnerabilities[] | null
//   extraFields[] — describes additional form fields unique to this type
//   redTeamVectors[] — only for red_team type

export const PROPOSAL_TYPES = {

  // ── SMART CONTRACT ─────────────────────────────────────────────────────────
  smart_contract: {
    label: 'Smart Contract Audit',
    extraFields: ['loc'],
    methodology: [
      { day: 'Day 1',    title: 'Scope & Kickoff',         desc: 'Align on objectives, contracts in scope, and timeline. Repo access granted. Slot locked with 50% deposit.' },
      { day: 'Days 2–3', title: 'Manual + AI Review',      desc: 'Line-by-line manual review combined with SolidityScan AI engine. All findings cross-validated by senior auditors — zero false positives.' },
      { day: 'Day 4',    title: 'Draft Report Delivered',  desc: 'All findings with severity ratings, exploit scenarios, and fix recommendations. Readable by devs and non-technical stakeholders.' },
      { day: 'Day 5',    title: 'Your Team Applies Fixes', desc: "We're on Telegram/Discord to answer questions and review proposed solutions during remediation." },
      { day: 'Day 6',    title: 'Retest + Certification',  desc: 'We verify every fix, check for new issues, and issue your public audit report, security badge, and on-chain seal.' },
    ],
    competitors: (price) => [
      { name: 'Hacken',       price: `$${r(price*2.5)}`,  turnaround: '4–6 weeks',  notes: 'Junior-heavy teams' },
      { name: 'CertiK',      price: `$${r(price*4)}`,    turnaround: '6–8 weeks',  notes: 'Sales-focused, less depth' },
      { name: 'Trail of Bits',price: `$${r(price*7.5)}+`, turnaround: '8–12 weeks', notes: 'Enterprise queue backlog' },
      { name: 'CredShields',  price: `$${n(price)}`,      turnaround: '6 days avg', notes: '✓ Best value, fastest turnaround', highlight: true },
    ],
    vulnerabilities: [
      { vuln: 'Reentrancy',                  checks: ['Single-function reentrancy', 'Cross-function reentrancy', 'Read-only reentrancy'] },
      { vuln: 'Access Control',              checks: ['Privilege escalation', 'Missing ownership checks', 'Unprotected initializers'] },
      { vuln: 'Integer Overflow/Underflow',  checks: ['Unchecked arithmetic', 'SafeMath bypass patterns', 'Precision loss in division'] },
      { vuln: 'Flash Loan Attacks',          checks: ['Price oracle manipulation', 'Same-block exploit patterns', 'Collateral manipulation'] },
      { vuln: 'Oracle Manipulation',         checks: ['Price feed centralization', 'TWAP manipulation', 'Sandwich attack vectors'] },
      { vuln: 'Front-Running / MEV',         checks: ['Transaction ordering dependency', 'Commit-reveal patterns', 'Sandwich vulnerability'] },
      { vuln: 'Logic Errors',                checks: ['Business logic flaws', 'State machine violations', 'Invariant breaks'] },
      { vuln: 'Gas Optimisation',            checks: ['Unbounded loops', 'Storage vs memory misuse', 'Dead code paths'] },
      { vuln: 'Denial of Service',           checks: ['Griefing attacks', 'Block gas limit exploits', 'Push vs pull patterns'] },
      { vuln: 'Upgradability & Proxy Risks', checks: ['Storage collision', 'Initialisation vulnerabilities', 'Delegatecall misuse'] },
      { vuln: 'Token Standard Compliance',   checks: ['ERC-20/721/1155 deviations', 'Permit/approval exploits', 'Transfer hook risks'] },
      { vuln: 'Economic Attacks',            checks: ['Inflation/deflation vectors', 'Reward manipulation', 'Liquidity drain patterns'] },
      { vuln: 'Cross-Contract Interactions', checks: ['Untrusted external calls', 'Return value handling', 'Callback exploitation'] },
    ],
  },

  // ── DAML ───────────────────────────────────────────────────────────────────
  daml: {
    label: 'Daml Smart Contract Audit',
    extraFields: ['loc'],
    methodology: [
      { day: 'Day 1',    title: 'Scope & Kickoff',                  desc: 'Align on Daml models in scope, workflow boundaries, Canton topology, and integration surface. Repo + DAR access granted. Slot locked with 50% deposit.' },
      { day: 'Days 2–4', title: 'Template & Authorization Review',  desc: 'Line-by-line review of templates, signatories, controllers, observers, and choice logic. Validation of party authorization, consuming/non-consuming choices, and contract-key uniqueness guarantees.' },
      { day: 'Days 4–6', title: 'Workflow & Privacy Analysis',      desc: 'End-to-end workflow simulation across parties. Sub-transaction privacy, divulgence paths, disclosure correctness, and Canton domain trust assumptions validated against the intended business model.' },
      { day: 'Days 6–7', title: 'Integration & Off-Ledger Surface', desc: 'Review of Daml Triggers, automation bots, JSON API / Ledger API consumers, and DAR package-ID management. Assessment of upgrade safety and interface/template evolution paths.' },
      { day: 'Day 8',    title: 'Draft Report Delivered',           desc: 'All findings with severity ratings, exploit scenarios, and fix recommendations mapped to Daml best practices. Readable by Daml engineers and non-technical stakeholders.' },
      { day: 'Day 9',    title: 'Your Team Applies Fixes',          desc: "We're on Telegram/Discord/Slack to answer questions and review proposed solutions during remediation." },
      { day: 'Day 10',   title: 'Retest + Certification',           desc: 'We verify every fix, check for new issues introduced during remediation, and issue your public audit report and security badge.' },
    ],
    competitors: (price) => [
      { name: 'Trail of Bits',        price: `$${r(price*6)}+`, turnaround: '10–14 weeks', notes: 'Limited Daml-specific expertise' },
      { name: 'Runtime Verification', price: `$${r(price*5)}+`, turnaround: '8–12 weeks',  notes: 'Formal methods focus, slow cycle' },
      { name: 'Internal Review',      price: 'Internal cost',   turnaround: 'Unknown',     notes: 'Misses privacy / authorization edge cases' },
      { name: 'CredShields',          price: `$${n(price)}`,    turnaround: '10 days avg', notes: '✓ Daml-native, full workflow coverage', highlight: true },
    ],
    vulnerabilities: [
      { vuln: 'Signatory & Authorization Flaws',     checks: ['Missing or incorrect signatories', 'Unauthorized party acting as controller', 'Authorization failures in composed choices'] },
      { vuln: 'Choice Controller Logic',             checks: ['Consuming vs non-consuming misuse', 'Controller vs observer confusion', 'Choice-guard bypass patterns'] },
      { vuln: 'Privacy & Disclosure',                checks: ['Unintended divulgence via fetch/exercise', 'Sub-transaction privacy leakage', 'Observer over-disclosure'] },
      { vuln: 'Contract Key Integrity',              checks: ['Key uniqueness violations', 'Key maintainer correctness', 'Stale key reference bugs'] },
      { vuln: 'Template Evolution & Upgrade Safety', checks: ['Interface/template upgrade compatibility', 'DAR package-ID pinning', 'Breaking-change detection across versions'] },
      { vuln: 'Workflow Correctness',                checks: ['State-machine invariant breaks', 'Race conditions across choices', 'Archive/rollback path analysis'] },
      { vuln: 'Business Logic & Financial Modeling', checks: ['Asset conservation and supply invariants', 'Fee and settlement correctness', 'Rounding / precision errors'] },
      { vuln: 'Daml Trigger & Automation Security',  checks: ['Trigger authorization boundaries', 'Replay and idempotency guarantees', 'Failure-mode recovery'] },
      { vuln: 'Ledger API / JSON API Exposure',      checks: ['Unauthenticated endpoint access', 'Party impersonation via token misuse', 'Information leakage via query API'] },
      { vuln: 'Canton Topology & Trust',             checks: ['Domain trust assumptions', 'Synchronizer/participant compromise impact', 'Cross-domain transfer safety'] },
      { vuln: 'Off-Ledger Integration',              checks: ['Oracle and external service trust', 'Off-ledger secret management', 'Replay across integration boundaries'] },
      { vuln: 'Denial of Service & Resource Abuse',  checks: ['Unbounded choice/fetch loops', 'Party-held active-contract bloat', 'Trigger/bot starvation scenarios'] },
    ],
  },

  // ── FUZZING ────────────────────────────────────────────────────────────────
  fuzzing: {
    label: 'Fuzz Testing (FaaS)',
    extraFields: ['loc'],
    methodology: [
      { day: 'Days 1–3',  title: 'Protocol Mapping & Invariant Design', desc: 'We study your protocol architecture, document all state machines, and co-define the invariants that matter most — economic, access control, and solvency properties.' },
      { day: 'Days 3–7',  title: 'Handler & Harness Development',        desc: 'Custom Foundry/Echidna/Medusa harnesses built with handler-based call sequencing, configurable run depth, boundary value seeds, and fuzzed caller address sets.' },
      { day: 'Days 7–13', title: 'Campaign Execution',                   desc: 'Full fuzzing runs across all public/external functions, all state-changing sequences, cross-contract composability, and adversarial economic scenarios including MEV and timestamp manipulation.' },
      { day: 'Days 13–14',title: 'Reproducer Extraction & Triage',       desc: 'Every failing case minimised to its smallest reproducer. Findings triaged by severity, mapped to economic impact, and classified by invariant category with full seed data.' },
      { day: 'Day 14–15', title: 'Report, Gas Aggregation & Debrief',    desc: 'Full technical report with complete fuzz logs, seeds, gas profiling data, and prioritised remediation roadmap. Live debrief for full knowledge transfer.' },
    ],
    competitors: (price) => [
      { name: 'Spearbit / Cantina', price: `$${r(price*3)}`,  turnaround: '6–8 weeks',  notes: 'Heavy auditor reliance' },
      { name: 'Trail of Bits',      price: `$${r(price*5)}+`, turnaround: '8–12 weeks', notes: 'Enterprise backlog' },
      { name: 'DIY Foundry',        price: 'Internal cost',   turnaround: 'Unknown',    notes: 'No expertise, no reproducers' },
      { name: 'CredShields FaaS',   price: `$${n(price)}`,    turnaround: '14–15 days', notes: '✓ Structured, full seeds delivered', highlight: true },
    ],
    vulnerabilities: [
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
    ],
  },

  // ── MULTICHAIN ─────────────────────────────────────────────────────────────
  multichain: {
    label: 'Multi-Chain Deployment Audit',
    extraFields: ['loc', 'chains_in_scope'],
    methodology: [
      { day: 'Days 1–2',  title: 'Chain Inventory & Scope Mapping',  desc: 'We document all deployed chains, bridge dependencies, relayer configurations, and cross-chain message protocols in scope.' },
      { day: 'Days 2–5',  title: 'Chain-Specific Static Analysis',   desc: 'Per-chain code review covering compiler divergence, opcode availability, gas model differences, and CREATE2 determinism.' },
      { day: 'Days 5–9',  title: 'Cross-Chain Logic Review',         desc: 'End-to-end review of message integrity, replay protection, bridge trust assumptions, and state synchronisation logic across all chains.' },
      { day: 'Days 9–12', title: 'Integration & Chaos Testing',      desc: 'Full cross-chain lifecycle testing with bridge downtime simulations, adversarial relayer scenarios, and multi-chain invariant fuzzing.' },
      { day: 'Days 12–14',title: 'Report & Remediation Support',     desc: 'Chain-specific findings with severity ratings, remediation guidance per chain, and a live debrief session with your engineering team.' },
    ],
    competitors: (price) => [
      { name: 'Zellic',          price: `$${r(price*3)}`,  turnaround: '8–10 weeks',  notes: 'Limited multi-chain depth' },
      { name: 'Trail of Bits',   price: `$${r(price*6)}+`, turnaround: '10–14 weeks', notes: 'Enterprise pricing' },
      { name: 'Internal Review', price: 'Internal cost',   turnaround: 'Unknown',     notes: 'Misses cross-chain edge cases' },
      { name: 'CredShields',     price: `$${n(price)}`,    turnaround: '14 days avg', notes: '✓ Chain-specific + integration testing', highlight: true },
    ],
    vulnerabilities: [
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
    ],
  },

  // ── WEB APP ────────────────────────────────────────────────────────────────
  web_app: {
    label: 'Web Application Security Audit',
    extraFields: ['app_urls', 'auth_required', 'environments'],
    methodology: [
      { day: 'Day 1',    title: 'Scoping & Threat Modelling', desc: 'Define application boundaries, authentication flows, data assets, and attack surface. Threat model produced before any testing begins.' },
      { day: 'Days 2–3', title: 'Automated Scanning',         desc: 'Comprehensive automated scanning across OWASP Top 10 categories. All results manually triaged to eliminate false positives.' },
      { day: 'Days 3–5', title: 'Manual Penetration Testing', desc: 'Senior security engineers test business logic, authentication flows, authorisation controls, and injection vectors not covered by automation.' },
      { day: 'Days 5–6', title: 'Draft Report & Remediation', desc: 'Full findings report with CVSS scores, PoC reproduction steps, and prioritised fix guidance.' },
      { day: 'Day 7',    title: 'Retest & Certification',     desc: 'We verify every fix, confirm no regressions, and issue your security certificate suitable for investors and partners.' },
    ],
    competitors: (price) => [
      { name: 'Bishop Fox', price: `$${r(price*3)}`, turnaround: '4–6 weeks', notes: 'Large enterprise focus' },
      { name: 'NCC Group',  price: `$${r(price*4)}`, turnaround: '6–8 weeks', notes: 'Slow to mobilise' },
      { name: 'Bugcrowd',   price: 'Variable',        turnaround: 'Ongoing',  notes: 'Unstructured, no cert' },
      { name: 'CredShields',price: `$${n(price)}`,    turnaround: '7 days',   notes: '✓ Structured, certified, fast', highlight: true },
    ],
    vulnerabilities: [
      { vuln: 'Injection (SQLi, NoSQLi, LDAP)',     checks: ['SQL injection via all input vectors', 'NoSQL injection patterns', 'LDAP/XPath injection'] },
      { vuln: 'Broken Authentication',              checks: ['Credential stuffing resistance', 'Session fixation / hijacking', 'MFA bypass techniques'] },
      { vuln: 'Sensitive Data Exposure',            checks: ['Data in transit encryption', 'Secrets in frontend / source', 'Insecure direct object references'] },
      { vuln: 'XML External Entity (XXE)',           checks: ['DTD-based XXE attacks', 'Blind XXE via OOB', 'File disclosure via XXE'] },
      { vuln: 'Broken Access Control',              checks: ['Horizontal privilege escalation', 'Vertical privilege escalation', 'Forced browsing / IDOR'] },
      { vuln: 'Security Misconfiguration',          checks: ['Default credentials', 'Unnecessary exposed services', 'Security headers absence'] },
      { vuln: 'Cross-Site Scripting (XSS)',         checks: ['Reflected XSS', 'Stored XSS', 'DOM-based XSS'] },
      { vuln: 'Insecure Deserialisation',           checks: ['Object injection', 'Remote code execution via deserialisation', 'Data tampering'] },
      { vuln: 'Known Vulnerable Components',        checks: ['Dependency CVE scanning', 'Outdated library detection', 'Supply chain risk'] },
      { vuln: 'Insufficient Logging & Monitoring',  checks: ['Audit trail completeness', 'Alerting coverage', 'Log injection'] },
      { vuln: 'Server-Side Request Forgery (SSRF)', checks: ['Internal network access via SSRF', 'Cloud metadata exploitation', 'Protocol-smuggling attacks'] },
      { vuln: 'Business Logic Flaws',               checks: ['Race conditions', 'Workflow bypass', 'Price manipulation / coupon abuse'] },
      { vuln: 'API Security',                       checks: ['Mass assignment', 'Rate limiting absence', 'GraphQL introspection abuse'] },
      { vuln: 'Cryptographic Issues',               checks: ['Weak algorithm usage', 'Predictable token generation', 'Key management flaws'] },
    ],
  },

  // ── MOBILE ─────────────────────────────────────────────────────────────────
  mobile: {
    label: 'Mobile Application Security Audit',
    extraFields: ['mobile_platform', 'app_name', 'app_store_link'],
    methodology: [
      { day: 'Day 1',    title: 'App Acquisition & Setup',  desc: 'Obtain app binary (IPA/APK), configure test environment, set up proxy interception, and map all network endpoints.' },
      { day: 'Days 2–3', title: 'Static Analysis',          desc: 'Reverse engineer the app to inspect source code, hardcoded secrets, insecure storage patterns, and third-party SDK risks.' },
      { day: 'Days 3–5', title: 'Dynamic Analysis',         desc: 'Runtime analysis of network traffic, API calls, session handling, certificate validation, and runtime manipulation resistance.' },
      { day: 'Day 6',    title: 'Report & Remediation',     desc: 'Findings with OWASP Mobile Top 10 mapping, CVSS scores, and step-by-step fix guidance for iOS/Android developers.' },
      { day: 'Day 7',    title: 'Retest & Sign-Off',        desc: 'Verify all fixes, re-test critical paths, and issue your mobile security certificate for app store and enterprise distribution.' },
    ],
    competitors: (price) => [
      { name: 'NowSecure',  price: `$${r(price*3)}`, turnaround: '4–6 weeks', notes: 'Automated-heavy' },
      { name: 'Praetorian', price: `$${r(price*4)}`, turnaround: '6–8 weeks', notes: 'Limited mobile team' },
      { name: 'Internal QA',price: 'Internal cost',   turnaround: 'Ongoing',  notes: 'Misses security edge cases' },
      { name: 'CredShields',price: `$${n(price)}`,    turnaround: '7 days',   notes: '✓ iOS + Android, full cert', highlight: true },
    ],
    vulnerabilities: [
      { vuln: 'Improper Platform Usage',    checks: ['Android permissions misuse', 'iOS entitlements review', 'Clipboard data leakage'] },
      { vuln: 'Insecure Data Storage',      checks: ['Unencrypted local storage', 'SQLite/Realm database review', 'Keychain/Keystore misuse'] },
      { vuln: 'Insecure Communication',     checks: ['Certificate pinning bypass', 'Cleartext HTTP usage', 'Man-in-the-middle susceptibility'] },
      { vuln: 'Insecure Authentication',    checks: ['Biometric authentication bypass', 'Weak PIN/passcode policies', 'Session token handling'] },
      { vuln: 'Insufficient Cryptography',  checks: ['Hardcoded keys/secrets', 'Weak algorithm usage', 'IV reuse / CBC padding'] },
      { vuln: 'Insecure Authorisation',     checks: ['Client-side authorisation checks', 'Role enforcement server-side', 'Privilege escalation via API'] },
      { vuln: 'Client Code Quality',        checks: ['Injection via IPC/intents', 'Buffer overflows (native code)', 'Third-party library vulnerabilities'] },
      { vuln: 'Code Tampering',             checks: ['Anti-tampering controls', 'Runtime patching resistance', 'Debug mode detection'] },
      { vuln: 'Reverse Engineering',        checks: ['Obfuscation assessment', 'String/secret exposure', 'Binary analysis resistance'] },
      { vuln: 'Extraneous Functionality',   checks: ['Hidden debug endpoints', 'Backdoor identification', 'Test credentials left in binary'] },
      { vuln: 'Network Security',           checks: ['API endpoint enumeration', 'GraphQL / REST fuzzing', 'Token replay attacks'] },
      { vuln: 'Malware & Supply Chain',     checks: ['Third-party SDK risk', 'Dynamic code loading', 'Package integrity verification'] },
    ],
  },

  // ── TRADITIONAL ────────────────────────────────────────────────────────────
  traditional: {
    label: 'Traditional Security Assessment',
    extraFields: ['assets_in_scope', 'compliance_framework', 'custom_vulnerabilities'],
    methodology: [
      { day: 'Days 1–2', title: 'Asset Discovery & Scope',  desc: 'Enumerate all in-scope assets: networks, cloud infrastructure, endpoints, applications, and third-party integrations.' },
      { day: 'Days 2–5', title: 'Vulnerability Assessment', desc: 'Automated scanning of all in-scope systems with manual triage to eliminate false positives and confirm exploitability.' },
      { day: 'Days 5–8', title: 'Penetration Testing',      desc: 'Manual exploitation of identified vulnerabilities to demonstrate real-world impact and chain attack paths.' },
      { day: 'Days 8–9', title: 'Risk Assessment & Report', desc: 'CVSS-scored findings with business impact analysis, regulatory mapping, and prioritised remediation plan.' },
      { day: 'Day 10',   title: 'Remediation Support',      desc: 'Support your team through fixes, re-test critical findings, and issue a remediation certificate suitable for auditors and partners.' },
    ],
    competitors: (price) => [
      { name: 'Deloitte Cyber', price: `$${r(price*5)}+`, turnaround: '8–12 weeks',  notes: 'Big 4 overhead costs' },
      { name: 'PwC Security',   price: `$${r(price*6)}+`, turnaround: '10–14 weeks', notes: 'Slow, heavily process-driven' },
      { name: 'Rapid7 MDR',     price: 'Subscription',    turnaround: 'Ongoing',     notes: 'No point-in-time cert' },
      { name: 'CredShields',    price: `$${n(price)}`,    turnaround: '10 days avg', notes: '✓ Certified, regulatory-ready', highlight: true },
    ],
    vulnerabilities: null, // uses custom_vulnerabilities from form
  },

  // ── RED TEAM ────────────────────────────────────────────────────────────────
  red_team: {
    label: 'Red Team Engagement',
    extraFields: ['red_team_vectors', 'crown_jewels', 'threat_actor_profile', 'rules_of_engagement', 'physical_in_scope', 'social_engineering_in_scope', 'detection_testing'],
    methodology: [
      { day: 'Phase 1', title: 'Threat Modelling & Scoping',               desc: 'We work with you to define crown jewels, the threat actors most likely to target you, rules of engagement, and success criteria. For Web3 clients this includes on-chain asset mapping and protocol dependency graphing.' },
      { day: 'Phase 2', title: 'Reconnaissance & OSINT',                   desc: 'Passive and active intelligence gathering from the adversary\'s perspective. This phase replicates what an attacker would know before launching an operation — and often surfaces critical exposures on its own.' },
      { day: 'Phase 3', title: 'Initial Access & Exploitation',            desc: 'Targeted attempts to breach your perimeter using gathered intelligence — across technical, human, and physical vectors simultaneously where applicable. No script-kiddie tools; custom tradecraft only.' },
      { day: 'Phase 4', title: 'Escalation, Persistence & Lateral Movement',desc: 'Once initial access is obtained, we simulate how an advanced attacker would maintain presence, escalate privileges, and move laterally — while testing whether your detection capabilities fire.' },
      { day: 'Phase 5', title: 'Objective Achievement & Impact Analysis',  desc: 'We attempt to achieve predefined objectives (data exfiltration, fund theft simulation, protocol drain) and document exactly how far we got, what controls failed, and the real-world impact.' },
      { day: 'Phase 6', title: 'Reporting, Debrief & Remediation Roadmap', desc: 'Full written report delivered — executive summary for leadership, technical deep-dive for your security team, and a prioritised remediation roadmap with effort vs. impact scoring.' },
    ],
    competitors: (price) => [
      { name: 'Mandiant / Google', price: `$${r(price*6)}+`, turnaround: '12–16 weeks', notes: 'Enterprise only, heavy process' },
      { name: 'CrowdStrike',       price: `$${r(price*5)}+`, turnaround: '10–14 weeks', notes: 'Slow mobilisation, high overhead' },
      { name: 'Cobalt.io',         price: `$${r(price*2)}`,  turnaround: '4–6 weeks',  notes: 'Platform-driven, less depth' },
      { name: 'CredShields',       price: `$${n(price)}`,    turnaround: 'Scoped',      notes: '✓ Web3-native, full-spectrum', highlight: true },
    ],
    vulnerabilities: null, // red team uses vectors + objectives, not a vuln table
    redTeamVectors: [
      { id: 'smart_contract',    num: '01', title: 'Smart Contract & Protocol Attacks',     desc: 'Adversarial review of smart contracts, protocol logic, tokenomics, and on-chain governance. Economic attacks, flash loan vectors, cross-protocol composability exploits, and upgrade path vulnerabilities.', tags: ['Flash loan attacks', 'Oracle manipulation', 'Governance attacks', 'Reentrancy', 'Economic exploits'] },
      { id: 'social_engineering',num: '02', title: 'Social Engineering & Phishing',         desc: 'Multi-stage human deception campaigns mirroring real attacker tradecraft. Targeted pretexts using OSINT, simulating spear-phishing, vishing, smishing, and SIM-swap attempts against key personnel.', tags: ['Spear-phishing', 'Vishing', 'SIM-swap simulation', 'Deepfake voice', 'Executive targeting'] },
      { id: 'infrastructure',    num: '03', title: 'Infrastructure & Cloud Penetration',    desc: 'Full-scope adversarial assessment of cloud environments (AWS, GCP, Azure), network architecture, APIs, containerised workloads, CI/CD pipelines, and internal infrastructure.', tags: ['Cloud IAM exploitation', 'CI/CD compromise', 'Network lateral movement', 'API abuse', 'Container escape'] },
      { id: 'ai_llm',            num: '04', title: 'AI & LLM Red Teaming',                 desc: 'Adversarial testing for organisations building on or with AI systems. Probe LLM deployments for prompt injection, jailbreaking, data extraction via inference, model poisoning, and RAG manipulation.', tags: ['Prompt injection', 'Jailbreak taxonomy', 'Training data extraction', 'Agentic pipeline abuse', 'RAG poisoning'] },
      { id: 'osint',             num: '05', title: 'OSINT & Threat Intelligence',           desc: 'Comprehensive open-source intelligence gathering from an attacker\'s perspective. Exposed credentials on dark web markets, leaked source code, inadvertent data exposures, and key personnel profiling.', tags: ['Dark web monitoring', 'Leaked credential discovery', 'Executive exposure mapping', 'GitHub/code leak detection', 'Brand impersonation'] },
      { id: 'physical',          num: '06', title: 'Physical Security Assessment',          desc: 'Physical intrusion testing of offices, data centres, and secure facilities. Tailgating, badge cloning, dumpster diving, and deployment of rogue devices — assessing physical controls as digital entry points.', tags: ['Tailgating & access bypass', 'RFID badge cloning', 'Rogue device deployment', 'CCTV blind spot mapping', 'Lock picking assessment'] },
      { id: 'insider_threat',    num: '07', title: 'Insider Threat Simulation',             desc: 'Simulate the actions of a malicious or negligent insider — a disgruntled employee, a compromised privileged account, or an unwitting contractor. Tests detection, DLP controls, and your assume-breach posture.', tags: ['Privileged account abuse', 'Data exfiltration testing', 'DLP control validation', 'SIEM/SOC detection gaps', 'Shadow IT discovery'] },
      { id: 'supply_chain',      num: '08', title: 'Supply Chain & Third-Party Risk',       desc: 'Assessment of your dependency attack surface — NPM/PyPI packages, SaaS tool integrations, vendor remote access, and open-source components. Map and stress-test trust relationships that attackers routinely leverage.', tags: ['Dependency confusion', 'Typosquatting packages', 'Vendor VPN/access review', 'SaaS OAuth risk', 'SBOM analysis'] },
    ],
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function r(n) { return Math.round(n).toLocaleString('en', { maximumFractionDigits: 0 }) }
function n(n) { return Number(n).toLocaleString() }

export const PROPOSAL_TYPE_OPTIONS = Object.entries(PROPOSAL_TYPES).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

export const COMPLIANCE_FRAMEWORKS = [
  'None / Not applicable',
  'ISO 27001',
  'SOC 2 Type II',
  'PCI-DSS Level 1',
  'DORA',
  'MAS TRM',
  'FCA',
  'NIST CSF',
  'HIPAA',
  'GDPR',
]

export const THREAT_ACTOR_PROFILES = [
  'Nation-state / APT',
  'Organised crime',
  'Opportunistic attacker',
  'Insider threat',
  'Competitor / corporate espionage',
  'Hacktivist',
]

export const MOBILE_PLATFORMS = ['iOS', 'Android', 'Both (iOS + Android)']