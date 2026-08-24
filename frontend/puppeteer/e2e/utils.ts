import assert from 'assert'
import { Browser, type FrameWaitForFunctionOptions, Page } from 'puppeteer'

const NEW_PAGE_TIMEOUT = 10 * 1000

/**
 * Console errors that must not fail a test because they are expected in the Puppeteer environment.
 */
const IGNORED_CONSOLE_ERRORS = [
  // If the SSE connection fails, the browser will restart it, it is not an application error
  '/sse',
  // React logs its development warnings (`validateDOMNesting`, unrecognized DOM props, …) as errors.
  // They only show up when running against the dev server, which is how these tests are run locally.
  'Warning:',
  // The stubbed GeoServer only serves MonitorEnv layers, so every MonitorFish map layer fails to load
  '/geoserver/wfs',
  "Nous n'avons pas pu récupérer"
]

class ConsoleListener {
  #isStopped = false

  start(page: Page, index: number) {
    page
      .on('console', message => {
        setImmediate(async () => {
          if (this.#isStopped) {
            return
          }

          const messageType = message.type().substr(0, 3).toUpperCase()
          console.log(`[Page ${index}] ${messageType}: ${message.text()}`)

          if (messageType === 'ERR') {
            console.log(message.args(), message.stackTrace())
            if (IGNORED_CONSOLE_ERRORS.some(ignoredError => message.text().includes(ignoredError))) {
              return
            }

            throw new Error(message.text())
          }
        })
      })
      .on('response', async response => {
        setImmediate(async () => {
          if (this.#isStopped) {
            return
          }

          if (response.url().includes('/bff/') || response.url().includes('/api/')) {
            console.log(`[Page ${index}] HTTP ${response.request().method()} ${response.status()}: ${response.url()}`)
          }
        })
      })
  }

  stop() {
    this.#isStopped = true
  }
}

export const consoleListener = new ConsoleListener()

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

export async function getFirstTab(browser: Browser) {
  const [firstTab] = await browser.pages()

  return firstTab as Page
}

/**
 * Open a new tab, and prefer it over {@link getFirstTab} whenever the spec types into the page:
 * the tab Firefox starts with intermittently stops accepting `Input.dispatchKeyEvent`.
 */
export async function openNewPage(browser: Browser): Promise<Page> {
  return browser.newPage()
}

/**
 * Wait for the next page opened by the application itself (i.e. via `window.open()`).
 *
 * Must be called **before** triggering the action opening that page, so that the pages already
 * opened are known and can be discarded:
 *
 * ```ts
 * const sideWindowPromise = waitForNewPage(browsers[0])
 * await openSideWindowButton.click()
 * const sideWindow = await sideWindowPromise
 * ```
 */
export async function waitForNewPage(browser: Browser): Promise<Page> {
  const knownTargets = new Set(browser.targets())

  // `Target.opener()` is not implemented by the WebDriver BiDi (Firefox) backend, hence the diffing
  const newTarget = await browser.waitForTarget(target => target.type() === 'page' && !knownTargets.has(target), {
    timeout: NEW_PAGE_TIMEOUT
  })

  const newPage = await newTarget.page()
  assert.ok(newPage, 'The newly opened target has no attached page.')

  return newPage
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
