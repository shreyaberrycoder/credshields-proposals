'use client'
import { useState, useEffect, useCallback } from 'react'

const disc    = (p)  => Math.round(((p.original_price - p.final_price) / p.original_price) * 100)
const fmt     = (n)  => Number(n).toLocaleString()
const fmtDate = (d)  => new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
const fmtTime = (d)  => new Date(d).toLocaleString('en-GB',  { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })

const EMPTY_FORM = {
  clientName:'', company:'',
  originalPrice:7500, finalPrice:4000,
  loc:1798, days:6,
  scopeDescription:'Smart contract security audit covering the full protocol codebase including staking, rewards, and access control logic.',
}

export default function Dashboard() {
  const [authed,     setAuthed]     = useState(false)
  const [password,   setPassword]   = useState('')
  const [pwError,    setPwError]    = useState('')
  const [proposals,  setProposals]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [copied,     setCopied]     = useState(null)
  const [expanded,   setExpanded]   = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)

  useEffect(() => {
    if (sessionStorage.getItem('cs_authed') === 'true') setAuthed(true)
  }, [])

  const login = async () => {
    setPwError('')
    const res = await fetch('/api/auth', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ password }),
    })
    if (res.ok) { sessionStorage.setItem('cs_authed','true'); setAuthed(true) }
    else setPwError('Incorrect password.')
  }
  const logout = () => { sessionStorage.removeItem('cs_authed'); setAuthed(false) }

  const fetchProposals = useCallback(async () => {
    const res  = await fetch('/api/proposals')
    const data = await res.json()
    setProposals(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { if (authed) fetchProposals() }, [authed, fetchProposals])

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const createProposal = async () => {
    if (!form.clientName || !form.company) return showToast('Client name and company required.','error')
    setLoading(true)
    const slug = form.company.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now().toString(36)
    const res = await fetch('/api/proposals', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, slug }),
    })
    if (res.ok) { closeForm(); fetchProposals(); showToast('Proposal created! Copy the link and send it.') }
    else showToast('Error creating proposal. Check Supabase setup.','error')
    setLoading(false)
  }

  const openEdit = (p) => {
    setEditTarget(p)
    setForm({ clientName:p.client_name, company:p.company, originalPrice:p.original_price, finalPrice:p.final_price, loc:p.loc, days:p.days, scopeDescription:p.scope_description||'' })
    setShowForm(true)
  }

  const saveEdit = async () => {
    if (!form.clientName || !form.company) return showToast('Client name and company required.','error')
    setLoading(true)
    const res = await fetch(`/api/proposals/${editTarget.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form),
    })
    if (res.ok) { closeForm(); fetchProposals(); showToast('Proposal updated.') }
    else showToast('Error saving changes.','error')
    setLoading(false)
  }

  const closeForm = () => { setShowForm(false); setEditTarget(null); setForm(EMPTY_FORM) }

  const deleteProposal = async (p) => {
    if (!confirm(`Delete proposal for ${p.company}?\n\n${p.leads?.length||0} captured email(s) will also be deleted. Cannot be undone.`)) return
    await fetch(`/api/proposals/${p.id}`, { method:'DELETE' })
    if (expanded === p.id) setExpanded(null)
    fetchProposals()
    showToast('Proposal deleted.')
  }

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`)
    setCopied(slug); showToast('Link copied!')
    setTimeout(() => setCopied(null), 2500)
  }

  const exportAll = () => {
    const rows = [['Company','Client','Email','Date']]
    proposals.forEach(p => p.leads?.forEach(l => rows.push([p.company, p.client_name, l.email, l.viewed_at])))
    const csv = rows.map(r => r.map(c=>`"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='all-leads.csv'; a.click()
  }

  const filtered   = proposals.filter(p => !search || p.client_name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase()))
  const totalViews = proposals.reduce((a,p) => a+(p.views||0), 0)
  const totalLeads = proposals.reduce((a,p) => a+(p.leads?.length||0), 0)
  const totalValue = proposals.reduce((a,p) => a+p.final_price, 0)
  const convRate   = proposals.length ? Math.round((proposals.filter(p=>p.leads?.length>0).length/proposals.length)*100) : 0

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={s.loginPage}>
      <div style={s.loginBox}>
        <div style={s.brand}>CRED<span style={{color:'#4fffa4'}}>SHIELDS</span></div>
        <p style={{color:'#7a8a9e',fontSize:'13px'}}>Sales Dashboard · Internal Only</p>
        <hr style={{width:'100%',border:'none',borderTop:'1px solid rgba(255,255,255,0.07)',margin:'4px 0'}}/>
        <input style={s.input} type="password" placeholder="Team password" value={password}
          onChange={e=>{setPassword(e.target.value);setPwError('')}} onKeyDown={e=>e.key==='Enter'&&login()} autoFocus/>
        {pwError && <p style={{color:'#ff4f6a',fontSize:'13px',alignSelf:'flex-start'}}>{pwError}</p>}
        <button style={{...s.btnGreen,width:'100%'}} onClick={login}>Enter Dashboard →</button>
        <p style={{fontSize:'11px',color:'#4a5568',marginTop:'4px'}}>Set DASHBOARD_PASSWORD in Vercel env vars</p>
      </div>
    </div>
  )

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* Toast */}
      {toast && <div style={{...s.toast, background:toast.type==='error'?'rgba(255,79,106,0.95)':'rgba(79,255,164,0.95)', color:toast.type==='error'?'#fff':'#080b12'}}>{toast.type==='error'?'✕ ':'✓ '}{toast.msg}</div>}

      {/* Header */}
      <header style={s.header}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={s.brand}>CRED<span style={{color:'#4fffa4'}}>SHIELDS</span></div>
          <span style={{fontSize:'12px',color:'#7a8a9e'}}>Sales Dashboard</span>
        </div>
        <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
          <button style={s.btnGhost} onClick={fetchProposals}>↻ Refresh</button>
          {totalLeads > 0 && <button style={s.btnGhost} onClick={exportAll}>↓ Export All Leads</button>}
          <button style={s.btnGhost} onClick={logout}>Log out</button>
          <button style={s.btnGreen} onClick={()=>{setEditTarget(null);setForm(EMPTY_FORM);setShowForm(true)}}>+ New Proposal</button>
        </div>
      </header>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          {num:proposals.length,       label:'Total Proposals', sub:'all time'},
          {num:totalViews,             label:'Total Views',      sub:'page opens'},
          {num:totalLeads,             label:'Emails Captured',  sub:'from gate'},
          {num:`$${fmt(totalValue)}`,  label:'Pipeline Value',   sub:'final prices'},
          {num:`${convRate}%`,         label:'Open → Lead Rate', sub:'proposals w/ email'},
        ].map(st=>(
          <div key={st.label} style={s.statCard}>
            <div style={s.statNum}>{st.num}</div>
            <div style={s.statLabel}>{st.label}</div>
            <div style={s.statSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={s.tableSection}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px',flexWrap:'wrap',gap:'12px'}}>
          <h2 style={{fontSize:'16px',fontWeight:700}}>All Proposals <span style={{color:'#7a8a9e',fontWeight:400,fontSize:'14px'}}>({filtered.length})</span></h2>
          <input style={{...s.input,width:'220px',padding:'8px 14px',fontSize:'13px'}} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{['Client','Company','Final Price','Discount','Views','Leads','Created','Actions'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length===0 && (
                <tr><td colSpan={8} style={{...s.td,textAlign:'center',padding:'72px 20px',color:'#7a8a9e'}}>
                  {search ? `No proposals matching "${search}"` : <span>No proposals yet. Click <strong style={{color:'#4fffa4'}}>+ New Proposal</strong>.</span>}
                </td></tr>
              )}
              {filtered.map(p=>(
                <>
                  <tr key={p.id}>
                    <td style={{...s.td,fontWeight:600}}>{p.client_name}</td>
                    <td style={s.td}>{p.company}</td>
                    <td style={{...s.td,color:'#4fffa4',fontFamily:'monospace',fontWeight:700,fontSize:'15px'}}>${fmt(p.final_price)}</td>
                    <td style={s.td}><span style={s.discBadge}>{disc(p)}% off</span></td>
                    <td style={{...s.td,color:p.views>0?'#e8edf5':'#7a8a9e'}}>{p.views||0}</td>
                    <td style={s.td}>
                      <button style={p.leads?.length>0?s.leadsBtn:s.leadsBtnEmpty} onClick={()=>setExpanded(expanded===p.id?null:p.id)}>
                        {p.leads?.length||0} email{p.leads?.length!==1?'s':''} {expanded===p.id?'▲':'▼'}
                      </button>
                    </td>
                    <td style={{...s.td,color:'#7a8a9e',fontSize:'12px'}}>{fmtDate(p.created_at)}</td>
                    <td style={s.td}>
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                        <button style={copied===p.slug?s.btnCopied:s.btnCopy} onClick={()=>copyLink(p.slug)} title="Copy shareable link">{copied===p.slug?'✓ Copied':'⎘ Link'}</button>
                        <button style={s.btnEdit} onClick={()=>openEdit(p)} title="Edit proposal">✎ Edit</button>
                        <button style={s.btnDel}  onClick={()=>deleteProposal(p)} title="Delete">✕</button>
                      </div>
                    </td>
                  </tr>

                  {expanded===p.id && (
                    <tr key={`${p.id}-exp`}>
                      <td colSpan={8} style={{...s.td,padding:0,background:'rgba(79,255,164,0.02)'}}>
                        <div style={{padding:'20px 24px',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                            <span style={{fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7a8a9e',fontFamily:'monospace'}}>Emails captured — {p.company}</span>
                            {p.leads?.length>0 && (
                              <button style={{...s.btnGhost,fontSize:'12px',padding:'5px 12px'}} onClick={()=>{
                                const csv='Email,Date\n'+p.leads.map(l=>`"${l.email}","${l.viewed_at}"`).join('\n')
                                const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download=`${p.company.replace(/\s+/g,'-')}-leads.csv`;a.click()
                              }}>↓ Export CSV</button>
                            )}
                          </div>
                          {!p.leads?.length && <p style={{color:'#7a8a9e',fontSize:'14px'}}>No emails yet. Share <code style={{color:'#4fffa4',fontSize:'12px'}}>/p/{p.slug}</code> to start.</p>}
                          {p.leads?.map((lead,i)=>(
                            <div key={lead.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderTop:i>0?'1px solid rgba(255,255,255,0.04)':'none'}}>
                              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'rgba(79,255,164,0.1)',border:'1px solid rgba(79,255,164,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:600,color:'#4fffa4'}}>
                                  {lead.email[0].toUpperCase()}
                                </div>
                                <span style={{fontSize:'14px'}}>{lead.email}</span>
                              </div>
                              <span style={{fontSize:'12px',color:'#7a8a9e'}}>{fmtTime(lead.viewed_at)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div style={s.overlay} onClick={e=>e.target===e.currentTarget&&closeForm()}>
          <div style={s.modal}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
              <h2 style={{fontSize:'20px',fontWeight:700}}>{editTarget?`Edit — ${editTarget.company}`:'Create New Proposal'}</h2>
              <button style={{background:'transparent',border:'none',color:'#7a8a9e',fontSize:'20px',cursor:'pointer'}} onClick={closeForm}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}}>
              {[
                {label:'Client Name *',     key:'clientName',       placeholder:'John Smith',    type:'text'},
                {label:'Protocol / Company *',key:'company',         placeholder:'Vouch Staking', type:'text'},
                {label:'Original Price USD', key:'originalPrice',   placeholder:'7500',          type:'number'},
                {label:'Final Price USD',    key:'finalPrice',      placeholder:'4000',          type:'number'},
                {label:'Lines of Code',      key:'loc',             placeholder:'1798',          type:'number'},
                {label:'Audit Days',         key:'days',            placeholder:'6',             type:'number'},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{fontSize:'10px',color:'#7a8a9e',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'7px',display:'block',fontFamily:'monospace'}}>{f.label}</label>
                  <input style={s.input} type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e=>setForm({...form,[f.key]:f.type==='number'?Number(e.target.value):e.target.value})}/>
                </div>
              ))}
              <div style={{gridColumn:'1/-1'}}>
                <label style={{fontSize:'10px',color:'#7a8a9e',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'7px',display:'block',fontFamily:'monospace'}}>Scope Description</label>
                <textarea style={{...s.input,height:'80px',resize:'vertical'}} value={form.scopeDescription} onChange={e=>setForm({...form,scopeDescription:e.target.value})}/>
              </div>
            </div>
            {form.originalPrice>0 && form.finalPrice>0 && (
              <div style={{background:'rgba(79,255,164,0.04)',border:'1px solid rgba(79,255,164,0.1)',borderRadius:'8px',padding:'12px 16px',marginBottom:'20px',display:'flex',gap:'20px',flexWrap:'wrap',fontSize:'13px',color:'#7a8a9e'}}>
                <span>Discount: <strong style={{color:'#4fffa4'}}>{Math.round(((form.originalPrice-form.finalPrice)/form.originalPrice)*100)}% off</strong></span>
                <span>Savings: <strong style={{color:'#4fffa4'}}>${fmt(form.originalPrice-form.finalPrice)}</strong></span>
                <span>Pays: <strong style={{color:'#4fffa4',fontFamily:'monospace'}}>${fmt(form.finalPrice)} USD</strong></span>
              </div>
            )}
            <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
              <button style={s.btnGhost} onClick={closeForm}>Cancel</button>
              <button style={{...s.btnGreen,opacity:loading?0.6:1}} onClick={editTarget?saveEdit:createProposal} disabled={loading}>
                {loading?(editTarget?'Saving...':'Creating...'):(editTarget?'Save Changes →':'Generate Proposal Link →')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page:       {minHeight:'100vh',background:'#080b12'},
  loginPage:  {minHeight:'100vh',background:'#080b12',display:'flex',alignItems:'center',justifyContent:'center'},
  loginBox:   {background:'#0d1120',border:'1px solid rgba(79,255,164,0.15)',borderRadius:'16px',padding:'48px 40px',width:'380px',display:'flex',flexDirection:'column',gap:'14px',alignItems:'center',textAlign:'center'},
  brand:      {fontWeight:800,fontSize:'18px',letterSpacing:'0.08em',color:'#fff'},
  header:     {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',borderBottom:'1px solid rgba(255,255,255,0.07)',background:'#0d1120',position:'sticky',top:0,zIndex:50,flexWrap:'wrap',gap:'12px'},
  statsGrid:  {display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px',padding:'28px 40px'},
  statCard:   {background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'20px'},
  statNum:    {fontSize:'26px',fontWeight:700,fontFamily:'monospace',color:'#4fffa4',marginBottom:'4px'},
  statLabel:  {fontSize:'13px',fontWeight:600,marginBottom:'2px'},
  statSub:    {fontSize:'11px',color:'#7a8a9e'},
  tableSection:{padding:'0 40px 60px'},
  tableWrap:  {background:'#0d1120',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',overflow:'auto'},
  table:      {width:'100%',borderCollapse:'collapse',minWidth:'800px'},
  th:         {padding:'13px 18px',textAlign:'left',fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7a8a9e',borderBottom:'1px solid rgba(255,255,255,0.07)',whiteSpace:'nowrap',fontFamily:'monospace'},
  td:         {padding:'15px 18px',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.04)',verticalAlign:'middle'},
  discBadge:  {background:'rgba(79,255,164,0.08)',color:'#4fffa4',border:'1px solid rgba(79,255,164,0.15)',padding:'3px 9px',borderRadius:'20px',fontSize:'11px',fontFamily:'monospace',whiteSpace:'nowrap'},
  leadsBtn:   {background:'rgba(79,255,164,0.06)',border:'1px solid rgba(79,255,164,0.15)',color:'#4fffa4',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'},
  leadsBtnEmpty:{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'#7a8a9e',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'},
  btnGreen:   {background:'linear-gradient(135deg,#4fffa4,#2de88a)',color:'#080b12',border:'none',padding:'9px 18px',borderRadius:'8px',fontWeight:700,fontSize:'13px',cursor:'pointer',whiteSpace:'nowrap'},
  btnGhost:   {background:'transparent',color:'#7a8a9e',border:'1px solid rgba(255,255,255,0.1)',padding:'9px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer',whiteSpace:'nowrap'},
  btnCopy:    {background:'rgba(79,255,164,0.07)',color:'#4fffa4',border:'1px solid rgba(79,255,164,0.2)',padding:'5px 10px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'monospace',whiteSpace:'nowrap'},
  btnCopied:  {background:'rgba(79,255,164,0.2)',color:'#4fffa4',border:'1px solid rgba(79,255,164,0.4)',padding:'5px 10px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',fontFamily:'monospace',whiteSpace:'nowrap'},
  btnEdit:    {background:'rgba(100,149,255,0.08)',color:'#7faeff',border:'1px solid rgba(100,149,255,0.2)',padding:'5px 10px',borderRadius:'6px',fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap'},
  btnDel:     {background:'rgba(255,79,106,0.07)',color:'#ff4f6a',border:'1px solid rgba(255,79,106,0.2)',padding:'5px 9px',borderRadius:'6px',fontSize:'11px',cursor:'pointer'},
  input:      {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'10px 14px',color:'#e8edf5',fontSize:'14px',width:'100%',outline:'none'},
  overlay:    {position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'20px'},
  modal:      {background:'#0d1120',border:'1px solid rgba(79,255,164,0.15)',borderRadius:'14px',padding:'36px',width:'100%',maxWidth:'620px',maxHeight:'92vh',overflowY:'auto'},
  toast:      {position:'fixed',bottom:'28px',right:'28px',padding:'12px 20px',borderRadius:'8px',fontSize:'14px',fontWeight:600,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'},
}
