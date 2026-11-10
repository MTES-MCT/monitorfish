/**
 * Render the flags SVG sources (`scripts/flags/*.svg`, from flag-icon-css) to small WebP images in `public/flags/`.
 *
 * Some SVG flags weigh up to 400 KB (coats of arms) while they are displayed at 20px:
 * rendered at twice their largest display size, they weigh 1-2 KB.
 *
 * Usage: `node scripts/generate_flags.mjs` (uses the locally installed Chrome).
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { basename, dirname, join } from 'path'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIRECTORY = join(SCRIPT_DIRECTORY, 'flags')
const OUTPUT_DIRECTORY = join(SCRIPT_DIRECTORY, '../public/flags')
// Largest display size is 27x20 px (vessel card), x2 for high-density screens
const WIDTH = 56
const HEIGHT = 42

const browser = await puppeteer.launch({ args: ['--no-proxy-server'], channel: 'chrome', headless: true })
const page = await browser.newPage()
await page.setViewport({ deviceScaleFactor: 1, height: HEIGHT, width: WIDTH })

const fileNames = (await readdir(SOURCE_DIRECTORY)).filter(fileName => fileName.endsWith('.svg'))
for (const fileName of fileNames) {
  const svg = await readFile(join(SOURCE_DIRECTORY, fileName), 'utf8')
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  await page.setContent(
    `<html><body style="margin:0"><img src="${dataUrl}" style="display:block;width:${WIDTH}px;height:${HEIGHT}px"></body></html>`,
    { waitUntil: 'load' }
  )

  const image = await page.screenshot({ omitBackground: true, quality: 90, type: 'webp' })
  await writeFile(join(OUTPUT_DIRECTORY, `${basename(fileName, '.svg')}.webp`), image)
}

await browser.close()

console.log(`${fileNames.length} flags generated in ${OUTPUT_DIRECTORY}`)
