import { NextResponse } from 'next/server'

export async function POST(req) {
  const { password } = await req.json()
  if (!process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'DASHBOARD_PASSWORD env var not set' }, { status: 500 })
  }
  if (password === process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
