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
    await page.setViewport({ width: 1440, height: 810 })
    await page.goto(`${baseUrl}/i/${id}`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluateHandle('document.fonts.ready')

    const pdf = await page.pdf({
      width: '1440px',
      height: '810px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="solidityscan-integration-proposal.pdf"`,
      },
    })
  } catch (err) {
    console.error('Integration PDF generation failed:', err)
    return new Response(JSON.stringify({ error: 'PDF generation failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  } finally {
    if (browser) await browser.close()
  }
}
