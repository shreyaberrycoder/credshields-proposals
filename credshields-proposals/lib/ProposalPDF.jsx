import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font, Link
} from '@react-pdf/renderer'
import { PROPOSAL_TYPES } from './proposalTypes'

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:        '#080b12',
  card:      '#0d1120',
  green:     '#4fffa4',
  greenDim:  '#2de88a',
  red:       '#ff4f6a',
  white:     '#e8edf5',
  muted:     '#7a8a9e',
  border:    '#1a2235',
  tagDefi:   '#7faeff',
  tagNft:    '#d07aff',
  tagRwa:    '#ffd07a',
  tagStake:  '#4fffa4',
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:        { backgroundColor: C.bg, color: C.white, fontFamily: 'Helvetica', padding: 0 },
  // Cover
  cover:       { minHeight: '100%', padding: 56, backgroundColor: C.bg, justifyContent: 'center' },
  eyebrow:     { fontSize: 8, letterSpacing: 2, color: C.green, textTransform: 'uppercase', marginBottom: 16 },
  coverTitle:  { fontSize: 52, fontWeight: 'bold', color: C.white, lineHeight: 1.05, marginBottom: 20 },
  coverTitleGreen: { color: C.green },
  coverSub:    { fontSize: 13, color: C.muted, maxWidth: 380, lineHeight: 1.7, marginBottom: 40 },
  coverMeta:   { flexDirection: 'row', gap: 32, flexWrap: 'wrap', marginBottom: 32 },
  metaLabel:   { fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 3 },
  metaValue:   { fontSize: 12, color: C.white, fontWeight: 'bold' },
  metaGreen:   { fontSize: 12, color: C.green, fontFamily: 'Courier', fontWeight: 'bold' },
  badge:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,255,164,0.2)', backgroundColor: 'rgba(79,255,164,0.04)', padding: '8 14', borderRadius: 4, marginTop: 8 },
  badgeDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: C.red, marginRight: 8 },
  badgeText:   { fontSize: 10, color: C.muted },
  // Sections
  section:     { padding: '48 56', borderBottomWidth: 1, borderBottomColor: C.border },
  sectionLabel:{ fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: C.green, marginBottom: 8, fontFamily: 'Courier' },
  sectionTitle:{ fontSize: 26, fontWeight: 'bold', marginBottom: 10, lineHeight: 1.2 },
  sectionSub:  { fontSize: 11, color: C.muted, maxWidth: 460, marginBottom: 28, lineHeight: 1.7 },
  green:       { color: C.green },
  // Urgency bar
  urgency:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,79,106,0.08)', borderWidth: 1, borderColor: 'rgba(255,79,106,0.2)', borderRadius: 6, padding: '12 16', marginBottom: 20 },
  urgencyText: { fontSize: 11, color: '#ffb3be', flex: 1 },
  urgencyBold: { color: C.red, fontWeight: 'bold' },
  // Price card
  priceCard:   { borderWidth: 1, borderColor: 'rgba(79,255,164,0.2)', borderRadius: 8, overflow: 'hidden', backgroundColor: C.card },
  priceHead:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '14 20', borderBottomWidth: 1, borderBottomColor: C.border },
  priceHeadTxt:{ fontSize: 12, fontWeight: 'bold', color: C.white },
  discBadge:   { fontSize: 8, color: C.green, backgroundColor: 'rgba(79,255,164,0.08)', borderWidth: 1, borderColor: 'rgba(79,255,164,0.15)', padding: '3 9', borderRadius: 20, fontFamily: 'Courier' },
  priceRow:    { flexDirection: 'row', justifyContent: 'space-between', padding: '10 20', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  priceLabel:  { fontSize: 11, color: C.muted },
  priceVal:    { fontSize: 11, color: C.white },
  priceStrike: { fontSize: 11, color: C.muted, textDecoration: 'line-through' },
  priceFinal:  { flexDirection: 'row', justifyContent: 'space-between', padding: '12 20', backgroundColor: 'rgba(79,255,164,0.04)' },
  priceFinalL: { fontSize: 15, fontWeight: 'bold', color: C.white },
  priceFinalR: { fontSize: 18, fontWeight: 'bold', color: C.green, fontFamily: 'Courier' },
  priceFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: '10 20', backgroundColor: 'rgba(255,255,255,0.02)', borderTopWidth: 1, borderTopColor: C.border },
  priceFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  priceFooterTick: { fontSize: 9, color: C.green },
  priceFooterTxt:  { fontSize: 9, color: C.muted },
  // Scope box
  scopeBox:    { marginTop: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: '14 16' },
  scopeLbl:    { fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, fontFamily: 'Courier', marginBottom: 6 },
  scopeTxt:    { fontSize: 11, color: C.white, lineHeight: 1.7 },
  // Timeline
  tlRow:       { flexDirection: 'row', gap: 20, marginBottom: 24 },
  tlDay:       { fontSize: 9, color: C.green, fontFamily: 'Courier', width: 72, textAlign: 'right', paddingTop: 2 },
  tlBody:      { flex: 1 },
  tlTitle:     { fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: C.white },
  tlDesc:      { fontSize: 10, color: C.muted, lineHeight: 1.6 },
  // Deliverable cards (3-col grid)
  delGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  delCard:     { width: '31%', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: '16 14' },
  delIcon:     { fontSize: 20, marginBottom: 8 },
  delTitle:    { fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: C.white },
  delDesc:     { fontSize: 9, color: C.muted, lineHeight: 1.6 },
  delTag:      { marginTop: 8, fontSize: 8, color: C.green, backgroundColor: 'rgba(79,255,164,0.06)', borderWidth: 1, borderColor: 'rgba(79,255,164,0.15)', padding: '2 8', borderRadius: 20, alignSelf: 'flex-start', fontFamily: 'Courier' },
  // Vuln table
  vulnTable:   { borderWidth: 1, borderColor: C.border, borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
  vulnTh:      { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.02)', padding: '8 14', borderBottomWidth: 1, borderBottomColor: C.border },
  vulnThTxt:   { fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase', color: C.muted, fontFamily: 'Courier' },
  vulnRow:     { flexDirection: 'row', padding: '10 14', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  vulnCat:     { fontSize: 10, fontWeight: 'bold', color: C.white, width: '34%' },
  vulnChecks:  { flex: 1 },
  vulnCheck:   { fontSize: 9, color: C.muted, lineHeight: 1.6, marginBottom: 1 },
  vulnBullet:  { fontSize: 9, color: C.green, marginRight: 4 },
  // Stats
  statsRow:    { flexDirection: 'row', borderWidth: 1, borderColor: C.border, borderRadius: 6, overflow: 'hidden', marginBottom: 24 },
  statBox:     { flex: 1, backgroundColor: C.card, padding: '20 16', alignItems: 'center' },
  statNum:     { fontSize: 22, fontWeight: 'bold', color: C.green, fontFamily: 'Courier', marginBottom: 4 },
  statLbl:     { fontSize: 8, color: C.muted, textAlign: 'center', lineHeight: 1.4 },
  // Testimonials
  testimonial: { backgroundColor: C.card, borderLeftWidth: 3, borderLeftColor: C.green, padding: '16 20', borderRadius: 4, marginBottom: 14 },
  testQuote:   { fontSize: 11, color: C.white, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 },
  testAuthor:  { fontSize: 10, fontWeight: 'bold', color: C.white },
  testRole:    { fontSize: 9, color: C.muted },
  // Audit rows
  auditRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: '12 16', marginBottom: 8 },
  auditName:   { fontSize: 11, fontWeight: 'bold', color: C.white, marginBottom: 4 },
  auditTag:    { fontSize: 8, padding: '2 8', borderRadius: 20, fontFamily: 'Courier' },
  auditFinding:{ fontSize: 10, color: C.muted },
  // Comparison table
  compTable:   { borderWidth: 1, borderColor: C.border, borderRadius: 6, overflow: 'hidden' },
  compTh:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  compThCell:  { flex: 1, padding: '10 14', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, fontFamily: 'Courier' },
  compThUs:    { flex: 1, padding: '10 14', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: C.green, fontFamily: 'Courier' },
  compRow:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  compCell:    { flex: 1, padding: '9 14', fontSize: 10, color: C.muted },
  compCellUs:  { flex: 1, padding: '9 14', fontSize: 10, color: C.green, backgroundColor: 'rgba(79,255,164,0.03)' },
  compCellBad: { flex: 1, padding: '9 14', fontSize: 10, color: C.red },
  compLabel:   { flex: 1, padding: '9 14', fontSize: 10, color: C.muted },
  // Red team vectors
  vectorRow:   { flexDirection: 'row', gap: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  vectorNum:   { fontSize: 9, color: C.green, fontFamily: 'Courier', width: 28, paddingTop: 2 },
  vectorBody:  { flex: 1 },
  vectorTitle: { fontSize: 13, fontWeight: 'bold', color: C.white, marginBottom: 6 },
  vectorDesc:  { fontSize: 10, color: C.muted, lineHeight: 1.65, marginBottom: 8 },
  vectorTags:  { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  vectorTag:   { fontSize: 8, color: C.green, backgroundColor: 'rgba(79,255,164,0.06)', borderWidth: 1, borderColor: 'rgba(79,255,164,0.12)', padding: '2 8', borderRadius: 20, fontFamily: 'Courier' },
  roeBox:      { marginTop: 16, backgroundColor: 'rgba(255,79,106,0.04)', borderWidth: 1, borderColor: 'rgba(255,79,106,0.15)', borderRadius: 6, padding: '14 16' },
  roeLbl:      { fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: C.red, fontFamily: 'Courier', marginBottom: 6 },
  roeTxt:      { fontSize: 11, color: C.white, lineHeight: 1.7 },
  scopePills:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  scopePill:   { fontSize: 9, padding: '4 12', borderRadius: 20, fontFamily: 'Courier' },
  // Threat cards
  threatGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  threatCard:  { width: '31%', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 6, padding: '14 12' },
  threatIcon:  { fontSize: 18, marginBottom: 6 },
  threatTitle: { fontSize: 10, fontWeight: 'bold', color: C.white, marginBottom: 4 },
  threatStat:  { fontSize: 8, color: C.green, fontFamily: 'Courier', marginBottom: 6 },
  threatDesc:  { fontSize: 9, color: C.muted, lineHeight: 1.55 },
  // CTA
  cta:         { padding: '56 56 48', backgroundColor: C.bg, alignItems: 'center' },
  ctaTitle:    { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, lineHeight: 1.2 },
  ctaSub:      { fontSize: 12, color: C.muted, textAlign: 'center', maxWidth: 400, lineHeight: 1.7, marginBottom: 28 },
  ctaBtn:      { backgroundColor: C.green, padding: '14 36', borderRadius: 6 },
  ctaBtnTxt:   { fontSize: 13, fontWeight: 'bold', color: C.bg },
  ctaTg:       { marginTop: 16, fontSize: 11, color: C.muted, textAlign: 'center' },
  ctaTgBold:   { color: C.white, fontWeight: 'bold' },
  // Footer
  footer:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '20 56', borderTopWidth: 1, borderTopColor: C.border },
  footerTxt:   { fontSize: 9, color: C.muted },
  footerLink:  { fontSize: 9, color: C.muted, textDecoration: 'underline' },
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt    = n => Number(n).toLocaleString()
const month  = d => new Date(d).toLocaleString('default', { month: 'long' })
const year   = d => new Date(d).getFullYear()

function SectionHeader({ label, title, titleGreen, sub }) {
  return (
    <View>
      <Text style={s.sectionLabel}>{label}</Text>
      <Text style={s.sectionTitle}>
        {title}
        {titleGreen ? <Text style={s.green}>{titleGreen}</Text> : null}
      </Text>
      {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
    </View>
  )
}

function VulnTable({ rows, col1 = 'VULNERABILITY', col2 = 'CHECKPOINTS' }) {
  if (!rows || rows.length === 0) return null
  return (
    <View style={s.vulnTable}>
      <View style={s.vulnTh}>
        <Text style={{ ...s.vulnThTxt, width: '34%' }}>{col1}</Text>
        <Text style={{ ...s.vulnThTxt, flex: 1 }}>{col2}</Text>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={s.vulnRow}>
          <Text style={s.vulnCat}>{row.vuln || row.category}</Text>
          <View style={s.vulnChecks}>
            {(row.checks || []).map((c, j) => (
              <View key={j} style={{ flexDirection: 'row', marginBottom: 2 }}>
                <Text style={s.vulnBullet}>·</Text>
                <Text style={s.vulnCheck}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

// ── Main PDF export ───────────────────────────────────────────────────────────
export function ProposalPDF({ proposal }) {
  const type      = proposal.proposal_type || 'smart_contract'
  const config    = PROPOSAL_TYPES[type] || PROPOSAL_TYPES.smart_contract
  const ef        = proposal.extraFields || {}
  const isRedTeam = type === 'red_team'
  const price     = proposal.final_price
  const disc      = proposal.original_price > proposal.final_price
    ? Math.round(((proposal.original_price - proposal.final_price) / proposal.original_price) * 100)
    : 0

  const timeline     = proposal.customTimeline || config.methodology || []
  const vulnRows     = config.vulnerabilities || null
  const customVulns  = proposal.customVulnerabilities || []
  const compRows     = config.competitors(price).filter(c => !c.highlight)

  const activeVectors = isRedTeam
    ? (ef.redTeamVectors || [])
        .map(id => config.redTeamVectors?.find(v => v.id === id))
        .filter(Boolean)
    : []

  const coverTitles = {
    smart_contract: ['Security\nAudit\n', 'Proposal'],
    fuzzing:        ['Fuzz Testing\n', 'Proposal'],
    multichain:     ['Multi-Chain\nSecurity\n', 'Audit'],
    web_app:        ['Web App\nSecurity\n', 'Audit'],
    mobile:         ['Mobile App\nSecurity\n', 'Audit'],
    traditional:    ['Security\nAssessment\n', 'Proposal'],
    red_team:       ['Think like\nthe enemy.\n', 'Before they do.'],
  }
  const [coverMain, coverAccent] = coverTitles[type] || coverTitles.smart_contract

  return (
    <Document title={`${proposal.company} — CredShields Proposal`} author="CredShields Technologies">

      {/* ══════════════════════════════════════════════════════════
          PAGE 1 — COVER
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.eyebrow}>— {config.label}</Text>
          <Text style={s.coverTitle}>
            {coverMain}
            <Text style={s.coverTitleGreen}>{coverAccent}</Text>
          </Text>
          <Text style={s.coverSub}>
            {isRedTeam
              ? `A full-spectrum adversarial engagement designed for ${proposal.company} — before a real attacker finds what your defences missed.`
              : `Prepared exclusively for ${proposal.client_name} at ${proposal.company}.`
            }
          </Text>
          <View style={s.coverMeta}>
            <View>
              <Text style={s.metaLabel}>Prepared by</Text>
              <Text style={s.metaValue}>CredShields Technologies Pte. Ltd.</Text>
            </View>
            <View>
              <Text style={s.metaLabel}>Scope</Text>
              <Text style={s.metaValue}>{proposal.company}</Text>
            </View>
            <View>
              <Text style={s.metaLabel}>Engagement Price</Text>
              <Text style={s.metaGreen}>${fmt(proposal.final_price)} USD</Text>
            </View>
            {isRedTeam && ef.threatActorProfile && (
              <View>
                <Text style={s.metaLabel}>Threat Profile</Text>
                <Text style={s.metaValue}>{ef.threatActorProfile}</Text>
              </View>
            )}
          </View>
          <View style={s.badge}>
            <View style={s.badgeDot} />
            <Text style={s.badgeText}>
              {isRedTeam
                ? 'Confidential engagement — NDA applies'
                : `Only 2 audit slots remaining in ${month(proposal.created_at)} — availability is limited`}
            </Text>
          </View>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE 2 — RED TEAM THREAT LANDSCAPE (red team only)
      ══════════════════════════════════════════════════════════ */}
      {isRedTeam && (
        <Page size="A4" style={s.page}>
          <View style={s.section}>
            <SectionHeader
              label="01 Why Red Teaming"
              title="The threat is real. "
              titleGreen="The question is readiness."
              sub="Traditional security audits find known vulnerabilities. Red teaming finds what attackers actually exploit — the gaps between your controls, your people, your protocols, and your assumptions."
            />
            <View style={s.threatGrid}>
              {[
                { icon: '⛓️', title: 'On-Chain Protocol Risk',     stat: '$3.6B lost in 2025',  desc: 'Smart contract vulnerabilities, flash loan attacks, oracle manipulation, and governance exploits continue to drain billions.' },
                { icon: '🎯', title: 'Advanced Persistent Threats', stat: '194 days avg dwell',  desc: 'Nation-state actors conduct multi-month reconnaissance campaigns. Standard defences are tested, mapped, and avoided before any attack.' },
                { icon: '🤖', title: 'AI-Augmented Attacks',        stat: 'New threat class',    desc: 'LLM-powered phishing, deepfake voice cloning, and adversarial prompt injection represent a threat class most teams are unprepared for.' },
                { icon: '👤', title: 'Human Element',               stat: '82% of breaches',     desc: '82% of breaches involve the human element. From spear-phishing to SIM-swapping key personnel, the weakest link is almost never a firewall.' },
                { icon: '☁️', title: 'Cloud & Infrastructure',       stat: '$4.8M avg cost',     desc: 'Misconfigured S3 buckets, over-privileged IAM roles, exposed CI/CD pipelines, and shadow IT create invisible attack paths.' },
                { icon: '🔗', title: 'Supply Chain Exposure',        stat: 'Growing attack vec',  desc: 'Dependency confusion, compromised packages, and vendor access are routinely leveraged for cascading compromise.' },
              ].map(t => (
                <View key={t.title} style={s.threatCard}>
                  <Text style={s.threatIcon}>{t.icon}</Text>
                  <Text style={s.threatTitle}>{t.title}</Text>
                  <Text style={s.threatStat}>↗ {t.stat}</Text>
                  <Text style={s.threatDesc}>{t.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════
          PAGE — PRICING / SCOPE
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <SectionHeader
            label={isRedTeam ? '02 Engagement Scope' : 'Scope & Pricing'}
            title={isRedTeam ? 'Engagement ' : 'Your Audit, '}
            titleGreen={isRedTeam ? 'Overview' : 'Scoped & Priced'}
            sub={isRedTeam
              ? 'Full-spectrum adversarial simulation — scoped around your specific threat model and crown jewels.'
              : "Everything included. No surprises. 50% to start, 50% after retest."}
          />
          <View style={s.urgency}>
            <Text style={s.urgencyText}>
              <Text style={s.urgencyBold}>
                {isRedTeam
                  ? 'Adversaries are already conducting reconnaissance against your organisation. '
                  : '$3.6B+ was lost to exploits in 2025. '}
              </Text>
              {isRedTeam
                ? "The question is not whether you'll be targeted — it's whether you'll know when it happens."
                : 'An audit at this stage is the highest-ROI security investment your protocol will ever make.'}
            </Text>
          </View>

          <View style={s.priceCard}>
            <View style={s.priceHead}>
              <Text style={s.priceHeadTxt}>{proposal.company} — {config.label}</Text>
              {disc > 0 && <Text style={s.discBadge}>{disc}% DISCOUNT APPLIED</Text>}
            </View>
            {[
              ['Client', proposal.client_name],
              ...(proposal.loc && !isRedTeam ? [['Lines of Code', fmt(proposal.loc)]] : []),
              ...(ef.chainsInScope ? [['Chains in Scope', ef.chainsInScope]] : []),
              ...(ef.mobilePlatform ? [['Platform', ef.mobilePlatform]] : []),
              ...(ef.appName ? [['Application', ef.appName]] : []),
              ...(ef.appUrls ? [['URL(s)', ef.appUrls]] : []),
              ...(ef.environments ? [['Environments', ef.environments]] : []),
              ...(ef.assetsInScope ? [['Assets in Scope', ef.assetsInScope]] : []),
              ...(ef.complianceFramework && ef.complianceFramework !== 'None / Not applicable' ? [['Compliance Target', ef.complianceFramework]] : []),
              ...(ef.crownJewels ? [['Crown Jewels / Objectives', ef.crownJewels]] : []),
              ...(ef.threatActorProfile ? [['Threat Actor Profile', ef.threatActorProfile]] : []),
              ['Duration', `${proposal.days} ${isRedTeam ? (proposal.days == 1 ? 'phase' : 'phases') : (proposal.days == 1 ? 'Business Day' : 'Business Days')}`],
              ...(disc > 0 ? [['Standard Price', null, `$${fmt(proposal.original_price)} USD`]] : []),
            ].map(([label, val, strike]) => (
              <View key={label} style={s.priceRow}>
                <Text style={s.priceLabel}>{label}</Text>
                {strike
                  ? <Text style={s.priceStrike}>{strike}</Text>
                  : <Text style={s.priceVal}>{val}</Text>}
              </View>
            ))}
            <View style={s.priceFinal}>
              <Text style={s.priceFinalL}>Engagement Price</Text>
              <Text style={s.priceFinalR}>${fmt(proposal.final_price)} USD</Text>
            </View>
            <View style={s.priceFooter}>
              {(isRedTeam
                ? ['50% upfront, 50% on delivery', 'Comprehensive NDA in place', 'All findings under strict confidentiality', 'Remediation support included']
                : ['50% upfront, 50% before retest', 'USDC / Fiat accepted', 'Free 3-month retest window']
              ).map(t => (
                <View key={t} style={s.priceFooterItem}>
                  <Text style={s.priceFooterTick}>✓</Text>
                  <Text style={s.priceFooterTxt}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {proposal.scope_description && (
            <View style={s.scopeBox}>
              <Text style={s.scopeLbl}>Engagement Scope</Text>
              <Text style={s.scopeTxt}>{proposal.scope_description}</Text>
            </View>
          )}
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE — RED TEAM VECTORS (red team only)
      ══════════════════════════════════════════════════════════ */}
      {isRedTeam && activeVectors.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.section}>
            <SectionHeader
              label="03 Attack Vectors"
              title="Eight vectors. "
              titleGreen="One integrated program."
              sub="The following vectors are in scope for this engagement."
            />
            {activeVectors.map(v => (
              <View key={v.id} style={s.vectorRow}>
                <Text style={s.vectorNum}>{v.num}</Text>
                <View style={s.vectorBody}>
                  <Text style={s.vectorTitle}>{v.title}</Text>
                  <Text style={s.vectorDesc}>{v.desc}</Text>
                  <View style={s.vectorTags}>
                    {v.tags.map(tag => (
                      <Text key={tag} style={s.vectorTag}>{tag}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
            {ef.rulesOfEngagement && (
              <View style={s.roeBox}>
                <Text style={s.roeLbl}>Rules of Engagement</Text>
                <Text style={s.roeTxt}>{ef.rulesOfEngagement}</Text>
              </View>
            )}
            <View style={s.scopePills}>
              {[
                { label: 'Physical Access', val: ef.physicalInScope },
                { label: 'Social Engineering', val: ef.socialEngineeringInScope },
                { label: 'Detection Testing', val: ef.detectionTesting },
              ].map(item => (
                <Text key={item.label} style={{
                  ...s.scopePill,
                  color: item.val === 'yes' ? C.green : C.muted,
                  backgroundColor: item.val === 'yes' ? 'rgba(79,255,164,0.06)' : 'rgba(255,255,255,0.03)',
                  borderWidth: 1,
                  borderColor: item.val === 'yes' ? 'rgba(79,255,164,0.2)' : 'rgba(255,255,255,0.08)',
                }}>
                  {item.val === 'yes' ? '✓' : '✗'} {item.label}
                </Text>
              ))}
            </View>
          </View>
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════
          PAGE — TIMELINE
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <SectionHeader
            label={isRedTeam ? '04 Methodology' : 'Audit Timeline'}
            title={isRedTeam ? 'Intelligence-led. ' : `Done in ${proposal.days} `}
            titleGreen={isRedTeam ? 'Objective-based.' : (proposal.days == 1 ? 'Day' : 'Days')}
            sub={isRedTeam
              ? 'Structured adversarial methodology modelled on real-world attacker playbooks — scoped around your specific objectives.'
              : 'Fast without cutting corners. Here is exactly what happens and when.'}
          />
          {timeline.map((item, i) => (
            <View key={i} style={s.tlRow}>
              <Text style={s.tlDay}>{item.day || item.duration || item.step}</Text>
              <View style={s.tlBody}>
                <Text style={s.tlTitle}>{item.title}</Text>
                <Text style={s.tlDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE — DELIVERABLES
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <SectionHeader
            label="Deliverables"
            title="What You "
            titleGreen="Walk Away With"
            sub={isRedTeam
              ? 'Every red team engagement produces actionable intelligence — not just a list of CVEs.'
              : 'Three compounding credibility assets not just a PDF.'}
          />
          <View style={s.delGrid}>
            {(isRedTeam ? [
              { icon: '📋', title: 'Executive Summary Report',  desc: 'Board-ready narrative of risk posture, key findings, and strategic recommendations.', tag: 'Board-ready' },
              { icon: '🔬', title: 'Full Technical Report',     desc: 'Step-by-step exploitation chains, proof-of-concept evidence, CVSS scoring, and remediation guidance.', tag: 'Engineer-ready' },
              { icon: '🗺️', title: 'Remediation Roadmap',      desc: 'Prioritised action plan with effort/impact scoring and a 30/60/90-day fix schedule.', tag: 'Actionable' },
              { icon: '🎤', title: 'Live Debrief Session',      desc: 'Walkthrough of all findings with your security and engineering teams. Attack replay and Q&A.', tag: 'Knowledge transfer' },
              { icon: '📡', title: 'Threat Intelligence Brief', desc: 'Curated intelligence on threat actors most likely to target your sector, with attacker TTPs.', tag: 'Sector-specific' },
              { icon: '📊', title: 'Maturity Benchmarking',     desc: 'Security posture benchmarked against industry peers across 12 capability domains.', tag: 'Benchmarked' },
              { icon: '✅', title: 'Re-test & Verification',    desc: 'Optional re-test of critical findings with a signed attestation letter confirming fix validation.', tag: 'Optional add-on' },
              { icon: '🔐', title: 'Audit-Ready Documentation', desc: 'Report formats compatible with ISO 27001, SOC 2, PCI-DSS, MAS TRM, DORA.', tag: 'Regulatory-ready' },
            ] : [
              { icon: '📋', title: 'Audit Report',   desc: 'Full findings with severity ratings, exploit scenarios, and fix guidance. Built for devs and investors alike.', tag: 'Public-ready' },
              { icon: '🛡️', title: 'Security Badge', desc: 'Display it on your site, pitch deck, and docs. Instant trust signal to users, VCs, and exchange listing teams.', tag: 'Display anywhere' },
              { icon: '⛓️', title: 'On-Chain Seal',  desc: 'Timestamped certificate, optionally hash-anchored on-chain. Covers exchange listings, grants, and VC due diligence.', tag: 'Hash-anchored' },
            ]).map(d => (
              <View key={d.title} style={s.delCard}>
                <Text style={s.delIcon}>{d.icon}</Text>
                <Text style={s.delTitle}>{d.title}</Text>
                <Text style={s.delDesc}>{d.desc}</Text>
                <Text style={s.delTag}>{d.tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE — VULNERABILITY COVERAGE (non-red-team)
      ══════════════════════════════════════════════════════════ */}
      {!isRedTeam && (vulnRows || customVulns.length > 0) && (
        <Page size="A4" style={s.page}>
          <View style={s.section}>
            <SectionHeader
              label="Vulnerability Coverage"
              title={vulnRows ? `${vulnRows.length} Categories ` : 'Custom '}
              titleGreen={vulnRows ? 'Mapped to Standards' : 'Vulnerability Coverage'}
              sub="Every category we assess — with the specific checkpoints our auditors verify for each."
            />
            <VulnTable rows={vulnRows || customVulns} />
          </View>
        </Page>
      )}

      {/* ══════════════════════════════════════════════════════════
          PAGE — SOCIAL PROOF + PAST AUDITS
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <SectionHeader
            label="Social Proof"
            title="Trusted by "
            titleGreen="200+ Organisations"
            sub={isRedTeam
              ? 'Our operators have conducted engagements across DeFi protocols, Web3 infrastructure, financial institutions, and regulated enterprises.'
              : "We don't just say we're good. Here's the track record."}
          />
          <View style={s.statsRow}>
            {[
              { num: '2.5M+', label: 'Scans on SolidityScan' },
              { num: '200+',  label: 'Global clients' },
              { num: '80+',   label: 'Blockchain platforms' },
            ].map(st => (
              <View key={st.label} style={st !== { num: '2.5M+', label: 'Scans on SolidityScan' } ? { ...s.statBox, borderLeftWidth: 1, borderLeftColor: C.border } : s.statBox}>
                <Text style={s.statNum}>{st.num}</Text>
                <Text style={s.statLbl}>{st.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.testimonial}>
            <Text style={s.testQuote}>"CredShields found a critical reentrancy vulnerability in our staking contract 48 hours before our mainnet launch. We would have lost everything. The team was sharp and actually understood our protocol architecture."</Text>
            <Text style={s.testAuthor}>Marcus K.</Text>
            <Text style={s.testRole}>CTO, DeFi Lending Protocol</Text>
          </View>
          <View style={s.testimonial}>
            <Text style={s.testQuote}>{isRedTeam
              ? '"The red team engagement was the most revealing exercise we\'ve conducted. They got further than we thought possible — through our Telegram admin account — in less than 72 hours."'
              : '"The audit report was the first thing our lead investor asked for in due diligence. Having the CredShields badge and the on-chain seal reference in our data room closed that conversation immediately."'
            }</Text>
            <Text style={s.testAuthor}>{isRedTeam ? 'James R.' : 'Sarah L.'}</Text>
            <Text style={s.testRole}>{isRedTeam ? 'CISO, Web3 Financial Protocol' : 'Founder, RWA Tokenization Protocol'}</Text>
          </View>
        </View>

        <View style={s.section}>
          <SectionHeader
            label="Track Record"
            title="Selected "
            titleGreen={isRedTeam ? 'Past Engagements' : 'Past Audits'}
            sub={isRedTeam ? 'Anonymised summaries of completed red team engagements.' : "We've protected protocols from pre-launch to post-listing across every major vertical."}
          />
          {(isRedTeam ? [
            { name: 'DeFi Protocol Red Team',       tag: 'Web3 / DeFi',      tagColor: C.tagDefi,  finding: 'Admin compromise via Telegram SIM-swap in 72h' },
            { name: 'Web3 Exchange Infrastructure', tag: 'Exchange / CeFi',  tagColor: C.tagRwa,   finding: 'CI/CD pipeline → prod key access via supply chain' },
            { name: 'DAO Governance Red Team',      tag: 'Governance / DAO', tagColor: C.tagStake, finding: 'Governance takeover via delegate manipulation' },
            { name: 'AI-Enabled Fintech',           tag: 'AI / LLM Risk',   tagColor: C.tagNft,   finding: 'System prompt extraction → data exfiltration via RAG' },
          ] : [
            { name: 'Tribally Gaming Protocol',   tag: 'Gaming / NFT', tagColor: C.tagNft,   finding: '2 Critical, 4 High bugs found' },
            { name: 'DeFi Lending Protocol',      tag: 'DeFi',         tagColor: C.tagDefi,  finding: '1 Critical reentrancy pre-launch' },
            { name: 'RWA Tokenization Platform',  tag: 'RWA',          tagColor: C.tagRwa,   finding: '3 High oracle manipulation vectors' },
            { name: 'Staking & Rewards Protocol', tag: 'Staking',      tagColor: C.tagStake, finding: 'Flash loan + access control fixes' },
          ]).map(a => (
            <View key={a.name} style={s.auditRow}>
              <View>
                <Text style={s.auditName}>{a.name}</Text>
                <Text style={{ ...s.auditTag, color: a.tagColor, backgroundColor: `${a.tagColor}18`, borderWidth: 1, borderColor: `${a.tagColor}33` }}>{a.tag}</Text>
              </View>
              <Text style={s.auditFinding}>{a.finding}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        {/* CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>
            {isRedTeam ? 'Ready to know\n' : 'Your security. Your users.\n'}
            <Text style={{ color: C.green }}>
              {isRedTeam ? "where you're exposed?" : 'Your reputation.'}
            </Text>
          </Text>
          <Text style={s.ctaSub}>
            {isRedTeam
              ? "The first conversation is confidential and focused on your specific threat model. We'll help you determine the right engagement scope."
              : "Don't ship unaudited. One exploited vulnerability undoes everything you've built — the community, the trust, the TVL."}
          </Text>
          <Link src="https://calendly.com/credshields-marketing/15min" style={s.ctaBtn}>
            <Text style={s.ctaBtnTxt}>
              {isRedTeam ? '→ Book a Scoping Call' : '→ Book Your Audit Slot Now'}
            </Text>
          </Link>
          <Text style={s.ctaTg}>
            Or DM on Telegram: <Text style={s.ctaTgBold}>@cred_shields</Text> — we respond within 2 hours.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>CredShields Technologies Pte. Ltd. · 20A Tanjong Pagar Road, Singapore 088443</Text>
          <Link src="https://credshields.com" style={s.footerLink}>
            <Text>credshields.com</Text>
          </Link>
        </View>
      </Page>

    </Document>
  )
}
