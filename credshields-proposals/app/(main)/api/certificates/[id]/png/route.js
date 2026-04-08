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
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })
    await page.goto(`${baseUrl}/c/${id}`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluateHandle('document.fonts.ready')

    const el = await page.$('.cert')
    const png = await el.screenshot({ type: 'png', omitBackground: false })

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="credshields-certificate-${id}.png"`,
      },
    })
  } catch (err) {
    console.error('Certificate PNG generation failed:', err)
    return new Response(JSON.stringify({ error: 'PNG generation failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  } finally {
    if (browser) await browser.close()
  }
}
