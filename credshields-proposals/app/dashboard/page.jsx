'use client'
import { useState, useEffect } from 'react'
import {
  PROPOSAL_TYPES, PROPOSAL_TYPE_OPTIONS,
  COMPLIANCE_FRAMEWORKS, THREAT_ACTOR_PROFILES, MOBILE_PLATFORMS
} from '../../lib/proposalTypes'

function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'success' ? '#0d2a1a' : '#2a0d0d', border: `1px solid ${type === 'success' ? '#4fffa4' : '#ff6b6b'}`, color: type === 'success' ? '#4fffa4' : '#ff6b6b', borderRadius: 6, padding: '12px 20px', fontFamily: 'monospace', fontSize: 13, maxWidth: 340 }}>
      {msg}
    </div>
  )
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUSES = ['draft', 'sent', 'in_review', 'won', 'lost']
const STATUS_COLORS = {
  draft:     { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)',  color: '#7a8a9e' },
  sent:      { bg: 'rgba(79,163,255,0.08)',  border: 'rgba(79,163,255,0.25)', color: '#4fa3ff' },
  in_review: { bg: 'rgba(245,197,66,0.08)',  border: 'rgba(245,197,66,0.25)', color: '#f5c542' },
  won:       { bg: 'rgba(79,255,164,0.08)',  border: 'rgba(79,255,164,0.25)', color: '#4fffa4' },
  lost:      { bg: 'rgba(255,79,106,0.08)',  border: 'rgba(255,79,106,0.25)', color: '#ff4f6a' },
}

const defaultForm = {
  clientName: '', company: '', originalPrice: '', finalPrice: '',
  loc: '', days: 6, scopeDescription: '', proposalType: 'smart_contract',
  expiresAt: '',
  customTimeline: [], customVulnerabilities: [],
  appUrls: '', authRequired: 'no', environments: '',
  mobilePlatform: 'Both (iOS + Android)', appName: '', appStoreLink: '',
  chainsInScope: '',
  assetsInScope: '', complianceFramework: 'None / Not applicable',
  redTeamVectors: [], crownJewels: '',
  threatActorProfile: 'Opportunistic attacker', rulesOfEngagement: '',
  physicalInScope: 'no', socialEngineeringInScope: 'yes', detectionTesting: 'yes',
}

export default function Dashboard() {
  const [authed,    setAuthed]    = useState(false)
  const [pw,        setPw]        = useState('')
  const [pwErr,     setPwErr]     = useState(false)
  const [proposals, setProposals] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState({ msg: '', type: 'success' })
  const [search,    setSearch]    = useState('')
  const [expanded,  setExpanded]  = useState({})
  const [editId,    setEditId]    = useState(null)
  const [activeTab, setActiveTab] = useState('proposals')
  const [form,      setForm]      = useState(defaultForm)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }
  function setF(key, val) { setForm(f => ({ ...f, [key]: val })) }

  // ── Auth ────────────────────────────────────────────────────────────────────
  async function login() {
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    if (res.ok) { setAuthed(true); loadProposals() }
    else setPwErr(true)
  }

  // ── Data ────────────────────────────────────────────────────────────────────
  async function loadProposals() {
    setLoading(true)
    const res = await fetch('/api/proposals')
    const data = await res.json()
    setProposals(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  // ── Submit / Edit ───────────────────────────────────────────────────────────
  async function submitProposal() {
    if (!form.clientName || !form.company || !form.finalPrice) {
      showToast('Client name, company, and price are required.', 'error'); return
    }
    const slug = editId ? undefined : `${form.company.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
    const payload = {
      clientName: form.clientName, company: form.company, slug,
      originalPrice: Number(form.originalPrice) || Number(form.finalPrice),
      finalPrice:    Number(form.finalPrice),
      loc:           Number(form.loc) || 0,
      days:          Number(form.days) || 6,
      scopeDescription:      form.scopeDescription,
      proposalType:          form.proposalType,
      expiresAt:             form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      customTimeline:        form.customTimeline.length > 0 ? JSON.stringify(form.customTimeline) : null,
      customVulnerabilities: form.customVulnerabilities.length > 0 ? JSON.stringify(form.customVulnerabilities) : null,
      extraFields:           JSON.stringify(buildExtraFields()),
      status:                'draft',
    }
    const url    = editId ? `/api/proposals/${editId}` : '/api/proposals'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      showToast(editId ? 'Proposal updated!' : 'Proposal created!', 'success')
      setForm(defaultForm); setEditId(null); loadProposals(); setActiveTab('proposals')
    } else {
      const err = await res.json()
      showToast(err.error || 'Error — check Supabase setup.', 'error')
    }
  }

  function buildExtraFields() {
    const t = form.proposalType
    if (t === 'web_app')     return { appUrls: form.appUrls, authRequired: form.authRequired, environments: form.environments }
    if (t === 'mobile')      return { mobilePlatform: form.mobilePlatform, appName: form.appName, appStoreLink: form.appStoreLink }
    if (t === 'multichain')  return { chainsInScope: form.chainsInScope }
    if (t === 'traditional') return { assetsInScope: form.assetsInScope, complianceFramework: form.complianceFramework }
    if (t === 'red_team')    return {
      redTeamVectors: form.redTeamVectors, crownJewels: form.crownJewels,
      threatActorProfile: form.threatActorProfile, rulesOfEngagement: form.rulesOfEngagement,
      physicalInScope: form.physicalInScope, socialEngineeringInScope: form.socialEngineeringInScope,
      detectionTesting: form.detectionTesting,
    }
    return {}
  }

  // ── Status inline update ────────────────────────────────────────────────────
  async function updateStatus(id, status) {
    await fetch(`/api/proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setProposals(ps => ps.map(p => p.id === id ? { ...p, status } : p))
  }

  // ── Clone ───────────────────────────────────────────────────────────────────
  async function cloneProposal(p) {
    const newSlug = `${p.company.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug:                  newSlug,
        clientName:            `${p.client_name} (copy)`,
        company:               p.company,
        originalPrice:         p.original_price,
        finalPrice:            p.final_price,
        loc:                   p.loc,
        days:                  p.days,
        scopeDescription:      p.scope_description,
        proposalType:          p.proposal_type,
        customTimeline:        p.custom_timeline,
        customVulnerabilities: p.custom_vulnerabilities,
        extraFields:           p.extra_fields,
        expiresAt:             null,
        status:                'draft',
      }),
    })
    if (res.ok) { showToast('Cloned as draft!', 'success'); loadProposals() }
    else showToast('Clone failed.', 'error')
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function deleteProposal(id) {
    if (!confirm('Delete this proposal?')) return
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    showToast('Deleted.', 'success'); loadProposals()
  }

  // ── Start edit ──────────────────────────────────────────────────────────────
  function startEdit(p) {
    setEditId(p.id)
    const ef = p.extra_fields
      ? (typeof p.extra_fields === 'string' ? JSON.parse(p.extra_fields) : p.extra_fields)
      : {}
    // Parse expiry back to YYYY-MM-DD for the date input
    let expiresAt = ''
    if (p.expires_at) {
      try { expiresAt = new Date(p.expires_at).toISOString().split('T')[0] } catch (e) {}
    }
    setForm({
      ...defaultForm,
      clientName: p.client_name, company: p.company,
      originalPrice: p.original_price, finalPrice: p.final_price,
      loc: p.loc || '', days: p.days || 6,
      scopeDescription: p.scope_description || '',
      proposalType: p.proposal_type || 'smart_contract',
      expiresAt,
      customTimeline:        p.custom_timeline ? JSON.parse(p.custom_timeline) : [],
      customVulnerabilities: p.custom_vulnerabilities ? JSON.parse(p.custom_vulnerabilities) : [],
      appUrls: ef.appUrls || '', authRequired: ef.authRequired || 'no', environments: ef.environments || '',
      mobilePlatform: ef.mobilePlatform || 'Both (iOS + Android)', appName: ef.appName || '', appStoreLink: ef.appStoreLink || '',
      chainsInScope: ef.chainsInScope || '',
      assetsInScope: ef.assetsInScope || '', complianceFramework: ef.complianceFramework || 'None / Not applicable',
      redTeamVectors: ef.redTeamVectors || [], crownJewels: ef.crownJewels || '',
      threatActorProfile: ef.threatActorProfile || 'Opportunistic attacker',
      rulesOfEngagement: ef.rulesOfEngagement || '',
      physicalInScope: ef.physicalInScope || 'no',
      socialEngineeringInScope: ef.socialEngineeringInScope || 'yes',
      detectionTesting: ef.detectionTesting || 'yes',
    })
    setActiveTab('new')
    window.scrollTo(0, 0)
  }

  // ── Export leads CSV ────────────────────────────────────────────────────────
  function exportLeads() {
    const rows = [['Proposal', 'Company', 'Type', 'Value', 'Email', 'Date']]
    proposals.forEach(p =>
      (p.leads || []).forEach(l =>
        rows.push([p.client_name, p.company, p.proposal_type, p.final_price, l.email, new Date(l.viewed_at).toLocaleDateString()])
      )
    )
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'credshields-leads.csv'; a.click()
  }

  // ── Timeline helpers ─────────────────────────────────────────────────────────
  const cfg = PROPOSAL_TYPES[form.proposalType] || PROPOSAL_TYPES.smart_contract
  const timeline = form.customTimeline.length > 0 ? form.customTimeline : cfg.methodology
  function updateTl(tl) { setF('customTimeline', tl) }
  function tlChange(i, field, val) { const tl = [...timeline]; tl[i] = { ...tl[i], [field]: val }; updateTl(tl) }
  function addTlStep() { updateTl([...timeline, { day: '', title: '', desc: '' }]) }
  function removeTlStep(i) { updateTl(timeline.filter((_, j) => j !== i)) }

  // ── Custom vuln helpers ──────────────────────────────────────────────────────
  function addVulnRow() { setF('customVulnerabilities', [...form.customVulnerabilities, { vuln: '', checks: ['', '', ''] }]) }
  function removeVulnRow(i) { setF('customVulnerabilities', form.customVulnerabilities.filter((_, j) => j !== i)) }
  function vulnChange(vi, field, val) { const v = [...form.customVulnerabilities]; v[vi] = { ...v[vi], [field]: val }; setF('customVulnerabilities', v) }
  function checkChange(vi, ci, val) { const v = [...form.customVulnerabilities]; v[vi].checks[ci] = val; setF('customVulnerabilities', v) }

  // ── Red team vector toggle ───────────────────────────────────────────────────
  function toggleVector(id) {
    const cur = form.redTeamVectors
    setF('redTeamVectors', cur.includes(id) ? cur.filter(v => v !== id) : [...cur, id])
  }

  // ── Computed stats ───────────────────────────────────────────────────────────
  const filtered   = proposals.filter(p =>
    p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.company?.toLowerCase().includes(search.toLowerCase())
  )
  const totalLeads = proposals.reduce((n, p) => n + (p.leads?.length || 0), 0)
  const withLeads  = proposals.filter(p => (p.leads?.length || 0) > 0).length
  const leadRate   = proposals.length ? Math.round((withLeads / proposals.length) * 100) : 0
  const wonCount   = proposals.filter(p => p.status === 'won').length
  const activeCount= proposals.filter(p => p.status === 'sent' || p.status === 'in_review').length

  // ── Style tokens ─────────────────────────────────────────────────────────────
  const S = {
    page:      { background: '#080b12', color: '#e8edf5', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 14 },
    wrap:      { maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' },
    nav:       { borderBottom: '1px solid rgba(79,255,164,0.08)', padding: '1rem 0' },
    h1:        { fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.1em', color: '#4fffa4', textTransform: 'uppercase' },
    card:      { background: '#0d1117', border: '1px solid rgba(79,255,164,0.08)', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' },
    label:     { fontFamily: 'monospace', fontSize: 10, color: '#7a8a9e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, display: 'block' },
    input:     { width: '100%', background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '9px 12px', color: '#e8edf5', fontFamily: 'monospace', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    select:    { width: '100%', background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '9px 12px', color: '#e8edf5', fontFamily: 'monospace', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    textarea:  { width: '100%', background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '9px 12px', color: '#e8edf5', fontFamily: 'monospace', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 },
    btn:       { background: '#4fffa4', color: '#080b12', border: 'none', padding: '9px 22px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    btnSm:     { background: 'transparent', color: '#4fffa4', border: '1px solid rgba(79,255,164,0.3)', padding: '5px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' },
    btnDanger: { background: 'transparent', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', padding: '5px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' },
    grid2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    grid3:     { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
    statBox:   { background: '#0d1117', border: '1px solid rgba(79,255,164,0.08)', borderRadius: 8, padding: '1rem 1.25rem' },
    statNum:   { fontSize: '1.8rem', fontWeight: 300, color: '#4fffa4', lineHeight: 1.2 },
    statLbl:   { fontFamily: 'monospace', fontSize: 9, color: '#7a8a9e', textTransform: 'uppercase', letterSpacing: '0.12em' },
    tabBtn:    (a) => ({ background: a ? 'rgba(79,255,164,0.08)' : 'transparent', color: a ? '#4fffa4' : '#7a8a9e', border: `1px solid ${a ? 'rgba(79,255,164,0.25)' : 'rgba(255,255,255,0.06)'}`, padding: '6px 18px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }),
    sectionHdr:{ fontFamily: 'monospace', fontSize: 10, color: '#4fffa4', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, marginTop: 24, borderBottom: '1px solid rgba(79,255,164,0.08)', paddingBottom: 6 },
    toggle:    (on) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 4, border: `1px solid ${on ? 'rgba(79,255,164,0.3)' : 'rgba(255,255,255,0.08)'}`, background: on ? 'rgba(79,255,164,0.06)' : 'transparent', color: on ? '#4fffa4' : '#7a8a9e', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }),
    vectorCard:(sel) => ({ background: sel ? 'rgba(79,255,164,0.05)' : '#0a0f1a', border: `1px solid ${sel ? 'rgba(79,255,164,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }),
  }

  // ── Login screen ──────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(79,255,164,0.2)', borderRadius: 12, padding: '2.5rem 2rem', maxWidth: 380, width: '90%', textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#7a8a9e', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>CredShields · Sales Dashboard</div>
        <h2 style={{ fontSize: 18, fontWeight: 300, marginBottom: '1.5rem', color: '#e8edf5' }}>Sign In</h2>
        <input style={{ ...S.input, marginBottom: 10, textAlign: 'center', letterSpacing: '0.1em' }} type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        {pwErr && <div style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 8 }}>Incorrect password</div>}
        <button style={{ ...S.btn, width: '100%' }} onClick={login}>Access Dashboard</button>
      </div>
    </div>
  )

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <Toast msg={toast.msg} type={toast.type} />

      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ ...S.wrap, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={S.h1}>CredShields · Proposals</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {totalLeads > 0 && <button style={S.btnSm} onClick={exportLeads}>⬇ Export Leads</button>}
            <button style={S.btnDanger} onClick={() => setAuthed(false)}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={S.wrap}>

        {/* ── STATS ── 6 boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, margin: '1.5rem 0' }}>
          {[
            { label: 'Proposals',   val: proposals.length },
            { label: 'Active',      val: activeCount },
            { label: 'Won',         val: wonCount },
            { label: 'Total Leads', val: totalLeads },
            { label: 'Total Views', val: proposals.reduce((n, p) => n + (p.views || 0), 0) },
            { label: 'Lead Rate',   val: `${leadRate}%` },
          ].map(s => (
            <div key={s.label} style={S.statBox}>
              <div style={S.statNum}>{s.val}</div>
              <div style={S.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          <button style={S.tabBtn(activeTab === 'proposals')} onClick={() => setActiveTab('proposals')}>All Proposals</button>
          <button style={S.tabBtn(activeTab === 'new')} onClick={() => { setActiveTab('new'); setEditId(null); setForm(defaultForm) }}>
            {editId ? '✎ Editing Proposal' : '+ New Proposal'}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            PROPOSAL LIST TAB
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'proposals' && (
          <div>
            <input style={{ ...S.input, marginBottom: '1rem', maxWidth: 320 }}
              placeholder="Search client or company…" value={search} onChange={e => setSearch(e.target.value)} />

            {loading && <p style={{ color: '#7a8a9e', fontFamily: 'monospace', fontSize: 12 }}>Loading…</p>}

            {filtered.map(p => {
              const sc = STATUS_COLORS[p.status] || STATUS_COLORS.draft
              const isExpired = p.expires_at && new Date(p.expires_at) < new Date()
              return (
                <div key={p.id} style={{ ...S.card, marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>

                    {/* ── Left: meta ── */}
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                        {p.client_name}
                        <span style={{ color: '#7a8a9e', fontWeight: 400 }}> · {p.company}</span>
                        {isExpired && (
                          <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 10, color: '#ff4f6a', background: 'rgba(255,79,106,0.08)', border: '1px solid rgba(255,79,106,0.2)', padding: '1px 8px', borderRadius: 20 }}>
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Type badge */}
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#4fffa4', background: 'rgba(79,255,164,0.06)', border: '1px solid rgba(79,255,164,0.15)', padding: '2px 9px', borderRadius: 20 }}>
                          {PROPOSAL_TYPES[p.proposal_type]?.label || 'Smart Contract Audit'}
                        </span>
                        {/* Stats */}
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#7a8a9e' }}>
                          ${Number(p.final_price).toLocaleString()} · {p.views || 0} views · {p.leads?.length || 0} leads
                        </span>
                        {/* Expiry label */}
                        {p.expires_at && !isExpired && (
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#7a8a9e' }}>
                            expires {new Date(p.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Right: status dropdown + action buttons ── */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>

                      {/* STATUS DROPDOWN — saves on change, no submit needed */}
                      <select
                        value={p.status || 'draft'}
                        onChange={e => updateStatus(p.id, e.target.value)}
                        style={{
                          background: sc.bg, color: sc.color,
                          border: `1px solid ${sc.border}`,
                          borderRadius: 4, padding: '5px 10px',
                          fontFamily: 'monospace', fontSize: 11,
                          outline: 'none', cursor: 'pointer',
                        }}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                        ))}
                      </select>

                      {/* PREVIEW — opens proposal bypassing the email gate, doesn't record a view */}
                      <button style={S.btnSm} onClick={() => window.open(`/p/${p.slug}?preview=1`, '_blank')}>
                        👁 Preview
                      </button>

                      {/* COPY LINK */}
                      <button style={S.btnSm} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${p.slug}`); showToast('Link copied!') }}>
                        📋 Copy Link
                      </button>

                      {/* PDF — downloads a real PDF, no print dialog */}
                      <button style={S.btnSm} onClick={() => window.open(`/api/pdf/${p.slug}`, '_blank')}>
                        ⬇ PDF
                      </button>

                      {/* CLONE — duplicates the proposal as a new draft */}
                      <button style={S.btnSm} onClick={() => cloneProposal(p)}>
                        ⧉ Clone
                      </button>

                      {/* EDIT */}
                      <button style={S.btnSm} onClick={() => startEdit(p)}>✎ Edit</button>

                      {/* DELETE */}
                      <button style={S.btnDanger} onClick={() => deleteProposal(p.id)}>✕</button>

                      {/* LEADS TOGGLE */}
                      <button style={S.btnSm} onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}>
                        {expanded[p.id] ? '▲ Leads' : '▼ Leads'}
                      </button>
                    </div>
                  </div>

                  {/* ── Leads expander ── */}
                  {expanded[p.id] && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(79,255,164,0.06)', paddingTop: '1rem' }}>
                      {(p.leads || []).length === 0
                        ? <p style={{ fontSize: 12, color: '#7a8a9e', fontFamily: 'monospace' }}>No leads yet.</p>
                        : p.leads.map((l, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                            <span>{l.email}</span>
                            <span style={{ color: '#7a8a9e', fontFamily: 'monospace', fontSize: 11 }}>{new Date(l.viewed_at).toLocaleString()}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            NEW / EDIT FORM TAB
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'new' && (
          <div style={S.card}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1.5rem', color: editId ? '#f5a623' : '#4fffa4' }}>
              {editId ? '✎ Edit Proposal' : '+ Create New Proposal'}
            </h2>

            {/* ── Core fields ── */}
            <div style={S.sectionHdr}>Core Details</div>

            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Proposal Type</label>
              <select style={S.select} value={form.proposalType}
                onChange={e => setForm(f => ({ ...f, proposalType: e.target.value, customTimeline: [], customVulnerabilities: [], redTeamVectors: [] }))}>
                {PROPOSAL_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div style={{ ...S.grid2, marginBottom: 14 }}>
              <div><label style={S.label}>Client Name *</label><input style={S.input} placeholder="e.g. Marcus K." value={form.clientName} onChange={e => setF('clientName', e.target.value)} /></div>
              <div><label style={S.label}>Company / Protocol *</label><input style={S.input} placeholder="e.g. Vouch Protocol" value={form.company} onChange={e => setF('company', e.target.value)} /></div>
            </div>

            <div style={{ ...S.grid3, marginBottom: 14 }}>
              <div><label style={S.label}>Original Price ($)</label><input style={S.input} type="number" placeholder="7500" value={form.originalPrice} onChange={e => setF('originalPrice', e.target.value)} /></div>
              <div><label style={S.label}>Final Price ($) *</label><input style={S.input} type="number" placeholder="4000" value={form.finalPrice} onChange={e => setF('finalPrice', e.target.value)} /></div>
              <div><label style={S.label}>{form.proposalType === 'red_team' ? 'Engagement Days' : 'Audit Days'}</label><input style={S.input} type="number" placeholder="6" value={form.days} onChange={e => setF('days', e.target.value)} /></div>
            </div>

            {/* EXPIRY DATE */}
            <div style={{ ...S.grid2, marginBottom: 14 }}>
              <div>
                <label style={S.label}>Proposal Expiry Date (optional)</label>
                <input style={S.input} type="date" value={form.expiresAt} onChange={e => setF('expiresAt', e.target.value)} />
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#7a8a9e', marginTop: 4 }}>
                  After this date the client sees an &quot;expired&quot; screen instead of the email gate
                </div>
              </div>
              <div>
                <label style={S.label}>Scope Description</label>
                <textarea style={{ ...S.textarea, minHeight: 56 }} placeholder="What's in scope for this engagement…" value={form.scopeDescription} onChange={e => setF('scopeDescription', e.target.value)} />
              </div>
            </div>

            {/* ── LOC ── */}
            {['smart_contract', 'fuzzing', 'multichain'].includes(form.proposalType) && (
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Lines of Code (LOC)</label>
                <input style={S.input} type="number" placeholder="1798" value={form.loc} onChange={e => setF('loc', e.target.value)} />
              </div>
            )}

            {/* ── MULTICHAIN: chains ── */}
            {form.proposalType === 'multichain' && (
              <>
                <div style={S.sectionHdr}>Multi-Chain Details</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Chains in Scope</label>
                  <input style={S.input} placeholder="e.g. Ethereum, Base, Arbitrum, Polygon" value={form.chainsInScope} onChange={e => setF('chainsInScope', e.target.value)} />
                </div>
              </>
            )}

            {/* ── WEB APP ── */}
            {form.proposalType === 'web_app' && (
              <>
                <div style={S.sectionHdr}>Web Application Details</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Application URL(s)</label>
                  <input style={S.input} placeholder="https://app.protocol.xyz, https://staging.protocol.xyz" value={form.appUrls} onChange={e => setF('appUrls', e.target.value)} />
                </div>
                <div style={{ ...S.grid2, marginBottom: 14 }}>
                  <div>
                    <label style={S.label}>Authentication Required</label>
                    <select style={S.select} value={form.authRequired} onChange={e => setF('authRequired', e.target.value)}>
                      <option value="no">No — public facing only</option>
                      <option value="yes">Yes — credentials will be provided</option>
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Environments in Scope</label>
                    <input style={S.input} placeholder="e.g. Staging + Production" value={form.environments} onChange={e => setF('environments', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* ── MOBILE ── */}
            {form.proposalType === 'mobile' && (
              <>
                <div style={S.sectionHdr}>Mobile Application Details</div>
                <div style={{ ...S.grid3, marginBottom: 14 }}>
                  <div>
                    <label style={S.label}>Platform</label>
                    <select style={S.select} value={form.mobilePlatform} onChange={e => setF('mobilePlatform', e.target.value)}>
                      {MOBILE_PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>App Name</label>
                    <input style={S.input} placeholder="e.g. Vouch Wallet" value={form.appName} onChange={e => setF('appName', e.target.value)} />
                  </div>
                  <div>
                    <label style={S.label}>App Store Link (optional)</label>
                    <input style={S.input} placeholder="https://apps.apple.com/…" value={form.appStoreLink} onChange={e => setF('appStoreLink', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* ── TRADITIONAL ── */}
            {form.proposalType === 'traditional' && (
              <>
                <div style={S.sectionHdr}>Assessment Details</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Assets in Scope</label>
                  <textarea style={{ ...S.textarea, minHeight: 60 }} placeholder="e.g. 10.0.0.0/24, api.company.com, AWS us-east-1 account #123…" value={form.assetsInScope} onChange={e => setF('assetsInScope', e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Compliance Framework</label>
                  <select style={S.select} value={form.complianceFramework} onChange={e => setF('complianceFramework', e.target.value)}>
                    {COMPLIANCE_FRAMEWORKS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* ── RED TEAM ── */}
            {form.proposalType === 'red_team' && (
              <>
                <div style={S.sectionHdr}>Engagement Vectors</div>
                <p style={{ fontSize: 12, color: '#7a8a9e', marginBottom: 12, fontFamily: 'monospace' }}>Select which attack vectors are in scope</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {PROPOSAL_TYPES.red_team.redTeamVectors.map(v => {
                    const sel = form.redTeamVectors.includes(v.id)
                    return (
                      <div key={v.id} style={S.vectorCard(sel)} onClick={() => toggleVector(v.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${sel ? '#4fffa4' : 'rgba(255,255,255,0.2)'}`, background: sel ? '#4fffa4' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#080b12', fontWeight: 700 }}>
                            {sel ? '✓' : ''}
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#7a8a9e' }}>{v.num}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: sel ? '#4fffa4' : '#e8edf5' }}>{v.title}</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#7a8a9e', lineHeight: 1.5, marginLeft: 24 }}>{v.desc.substring(0, 90)}…</p>
                      </div>
                    )
                  })}
                </div>

                <div style={S.sectionHdr}>Engagement Parameters</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Crown Jewels / Objectives</label>
                  <textarea style={{ ...S.textarea, minHeight: 60 }} placeholder="What is the attacker trying to reach? e.g. Admin keys, on-chain treasury, internal Slack, customer PII database…" value={form.crownJewels} onChange={e => setF('crownJewels', e.target.value)} />
                </div>
                <div style={{ ...S.grid2, marginBottom: 14 }}>
                  <div>
                    <label style={S.label}>Threat Actor Profile</label>
                    <select style={S.select} value={form.threatActorProfile} onChange={e => setF('threatActorProfile', e.target.value)}>
                      {THREAT_ACTOR_PROFILES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Rules of Engagement</label>
                    <input style={S.input} placeholder="e.g. No production disruption, notify CTO before physical testing" value={form.rulesOfEngagement} onChange={e => setF('rulesOfEngagement', e.target.value)} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={S.label}>Scope Inclusions</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                    {[
                      { key: 'physicalInScope',          label: 'Physical Access' },
                      { key: 'socialEngineeringInScope', label: 'Social Engineering' },
                      { key: 'detectionTesting',         label: 'Detection Testing (SOC unaware)' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', gap: 6 }}>
                        <button style={S.toggle(form[item.key] === 'yes')} onClick={() => setF(item.key, 'yes')}>✓ {item.label}</button>
                        <button style={S.toggle(form[item.key] === 'no')}  onClick={() => setF(item.key, 'no')}>✗ Exclude</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── TIMELINE ── */}
            <div style={S.sectionHdr}>
              {form.proposalType === 'red_team' ? 'Engagement Phases' : 'Audit Timeline'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 10 }}>
              <button style={S.btnSm} onClick={() => setF('customTimeline', [...cfg.methodology])}>Reset to Default</button>
              <button style={S.btnSm} onClick={addTlStep}>+ Add Step</button>
            </div>
            {timeline.map((step, i) => (
              <div key={i} style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input style={{ ...S.input, width: 90 }} placeholder="Day 1" value={step.day || step.duration || ''} onChange={e => tlChange(i, 'day', e.target.value)} />
                  <input style={{ ...S.input, flex: 1 }} placeholder="Step title" value={step.title} onChange={e => tlChange(i, 'title', e.target.value)} />
                  <button style={S.btnDanger} onClick={() => removeTlStep(i)}>✕</button>
                </div>
                <textarea style={{ ...S.textarea, minHeight: 56 }} placeholder="Description" value={step.desc} onChange={e => tlChange(i, 'desc', e.target.value)} />
              </div>
            ))}

            {/* ── VULNERABILITY COVERAGE ── */}
            {!['red_team'].includes(form.proposalType) && (
              <>
                <div style={S.sectionHdr}>Vulnerability Coverage</div>
                {['smart_contract','fuzzing','multichain','web_app','mobile'].includes(form.proposalType) && (
                  <div style={{ background: 'rgba(79,255,164,0.04)', border: '1px solid rgba(79,255,164,0.15)', borderRadius: 4, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#4fffa4', marginBottom: 12 }}>
                    ✓ Auto-populated with {
                      { smart_contract: '13 Smart Contract', fuzzing: '12 Fuzz Testing', multichain: '12 Multi-Chain', web_app: '14 Web Application (OWASP)', mobile: '12 OWASP Mobile' }[form.proposalType]
                    } vulnerability categories
                  </div>
                )}
                {form.proposalType === 'traditional' && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <button style={S.btnSm} onClick={addVulnRow}>+ Add Category</button>
                    </div>
                    {form.customVulnerabilities.map((v, vi) => (
                      <div key={vi} style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, padding: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input style={{ ...S.input, flex: 1 }} placeholder="Category name" value={v.vuln || v.category || ''} onChange={e => vulnChange(vi, 'vuln', e.target.value)} />
                          <button style={S.btnDanger} onClick={() => removeVulnRow(vi)}>✕</button>
                        </div>
                        {(v.checks || ['','','']).map((c, ci) => (
                          <input key={ci} style={{ ...S.input, marginBottom: 6 }} placeholder={`Checkpoint ${ci + 1}`} value={c} onChange={e => checkChange(vi, ci, e.target.value)} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Submit ── */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button style={S.btn} onClick={submitProposal}>{editId ? 'Save Changes' : 'Create & Get Link'}</button>
              {editId && (
                <button style={S.btnSm} onClick={() => { setEditId(null); setForm(defaultForm); setActiveTab('proposals') }}>Cancel</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
