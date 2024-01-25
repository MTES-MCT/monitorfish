import assert from 'assert'

export function listenToConsole(page, index) {
  page
    .on('console', message => {
      const messageType = message.type().substr(0, 3).toUpperCase()
      console.log(`[Page ${index}] ${messageType}: ${message.text()}`)

      if (messageType === 'ERR') {
        console.log(message.args(), message.stackTrace())
        if (message.args().includes('/sse')) {
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

export async function assertContains(page, selector, text) {
  const nodes = await page.$$eval(selector, elements => elements.map(element => element.textContent))
  const node = nodes.find(content => content.includes(text))

  assert.ok(node, `${selector} of value ${text} not found in array ${nodes}.`)
}

export async function getTextContent(page, selector) {
  const element = await page.waitForSelector(selector)

  return element.evaluate(el => el.textContent)
}

export async function getInputContent(page, selector) {
  const element = await page.waitForSelector(selector)

  return element.evaluate(el => el.value)
}

export async function getFirstTab(browser) {
  const [firstTab] = await browser.pages()

  return firstTab
}

export function wait(ms) {
  /* eslint-disable no-promise-executor-return */
  return new Promise(resolve => setTimeout(resolve, ms))
}
