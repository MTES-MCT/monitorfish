import assert from 'assert'
import { Page, Browser, type FrameWaitForFunctionOptions } from 'puppeteer'

export function listenToConsole(page: Page, index: number) {
  page
    .on('console', message => {
      const messageType = message.type().substr(0, 3).toUpperCase()
      console.log(`[Page ${index}] ${messageType}: ${JSON.stringify(message.text())}`)

      if (messageType === 'ERR') {
        console.log(message.args(), message.stackTrace())
        if (message.text().includes('/sse')) {
          // If the SSE connection fails, the browser will restart it, it is not an application error
          return
        }

        if (message.text().includes('/wfs')) {
          // If the SSE connection fails, the browser will restart it, it is not an application error
          return
        }

        throw new Error(message.text())
      }
    })
    .on('response', response => {
      if (response.url().includes('/bff/') || response.url().includes('/api/')) {
        console.log(`[Page ${index}] HTTP ${response.request().method()} ${response.status()}: ${response.url()}`)
      }
    })
}

export async function assertContains(page: Page, selector: string, text: string) {
  // TODO Remove ts-ignore when TS version is 4.9.3:
  // @ts-ignore: https://github.com/puppeteer/puppeteer/issues/9369
  const nodes = await page.$$eval(selector, elements => elements.map(element => element.textContent))
  const node = nodes.find(content => content?.includes(text))

  assert.ok(node, `${selector} of value ${text} not found in array ${nodes}.`)
}

export async function getTextContent(page: Page, selector: string) {
  const element = await page.waitForSelector(selector)

  return element && element.evaluate(el => el.textContent)
}

export async function getInputContent(page: Page, selector: string) {
  const element = await page.waitForSelector(selector)

  // From Puppeteer doc:
  //    If you are using TypeScript, you may have to provide an explicit type to the first argument of the pageFunction.
  //    By default it is typed as Element[], but you may need to provide a more specific sub-type
  // @ts-ignore
  return element && element.evaluate((el: HTMLInputElement) => el.value)
}

export async function getPage(browser: Browser) {
  const page = await browser.newPage()

  return page as Page
}

export function wait(ms: number) {
  /* eslint-disable no-promise-executor-return */
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitForSelectorWithText<Selector extends string>(
  page: Page,
  selector: Selector,
  text: string,
  options?: FrameWaitForFunctionOptions
) {
  await page.waitForFunction(`document.querySelector("${selector}").innerText.includes("${text}")`, options)
}

export async function getSideWindow() {
  const lastTarget = browsers[0].targets().length - 1

  return browsers[0].targets()[lastTarget]?.page()
}
