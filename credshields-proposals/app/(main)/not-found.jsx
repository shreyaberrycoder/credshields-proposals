import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight:'100vh', background:'#080b12', color:'#e8edf5',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', textAlign:'center',
      padding:'40px',
    }}>
      <div style={{fontSize:'48px', marginBottom:'24px'}}>🔒</div>
      <h1 style={{fontSize:'28px', fontWeight:800, marginBottom:'12px'}}>Proposal Not Found</h1>
      <p style={{color:'#7a8a9e', fontSize:'16px', maxWidth:'360px', lineHeight:1.6, marginBottom:'32px'}}>
        This proposal link is invalid or has been removed. Please check the link or contact the CredShields team.
      </p>
      <a
        href="https://credshields.com"
        style={{
          background:'linear-gradient(135deg,#4fffa4,#2de88a)', color:'#080b12',
          padding:'12px 28px', borderRadius:'8px', fontWeight:700, fontSize:'14px',
          textDecoration:'none',
        }}
      >
        Visit CredShields →
      </a>
    </div>
  )
}
