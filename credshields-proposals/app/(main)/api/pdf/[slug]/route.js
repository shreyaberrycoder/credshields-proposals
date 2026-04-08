import puppeteerCore from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const maxDuration = 60

async function getBrowser() {
  if (process.env.NODE_ENV === 'development') {
    const puppeteer = await import('puppeteer')
    return puppeteer.default.launch({ headless: true })
  }
  return puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })
}

export async function GET(request, { params }) {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    return new Response(JSON.stringify({ error: 'NEXT_PUBLIC_APP_URL is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const type = new URL(request.url).searchParams.get('type') || 'smart_contract'
  const prefix = type === 'fuzzing' ? '/f/' : type === 'red_team' ? '/r/' : type === 'multichain' ? '/m/' : '/p/'

  let browser
  try {
    browser = await getBrowser()
    const page = await browser.newPage()

    await page.goto(`${baseUrl}${prefix}${slug}?print=1`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready')

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="credshields-${slug}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation failed:', err)
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } finally {
    if (browser) await browser.close()
  }
}
