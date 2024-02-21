import type { Browser } from 'puppeteer'

declare global {
  const browsers: [Browser, Browser]
}
