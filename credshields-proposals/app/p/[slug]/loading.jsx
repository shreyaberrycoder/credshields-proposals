export default function Loading() {
  return (
    <div style={{
      minHeight:'100vh', background:'#080b12',
      display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px',
    }}>
      <div style={{
        width:'42px', height:'42px',
        background:'linear-gradient(135deg, #4fffa4, #2de88a)',
        clipPath:'polygon(50% 0%, 100% 20%, 100% 75%, 50% 100%, 0% 75%, 0% 20%)',
        animation:'pulse 1.5s ease-in-out infinite',
      }}/>
      <p style={{color:'#7a8a9e', fontSize:'14px', fontFamily:'monospace', letterSpacing:'0.1em'}}>
        Loading proposal...
      </p>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
