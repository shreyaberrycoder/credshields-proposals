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

export async function GET(req, { params }) {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    return new Response(JSON.stringify({ error: 'NEXT_PUBLIC_APP_URL is not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  let browser
  try {
    browser = await getBrowser()
    const page = await browser.newPage()
    await page.goto(`${baseUrl}/c/${id}`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluateHandle('document.fonts.ready')

    const pdf = await page.pdf({
      width: '794px',
      height: '1123px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="credshields-certificate-${id}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Certificate PDF generation failed:', err)
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  } finally {
    if (browser) await browser.close()
  }
}
