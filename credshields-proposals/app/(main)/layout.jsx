import './globals.css'


export const metadata = {
  title: 'CredShields — Proposals',
  description: 'Smart Contract Audit Proposals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
