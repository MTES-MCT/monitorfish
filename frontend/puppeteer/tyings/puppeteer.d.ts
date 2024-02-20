import type { Page as OriginalPage } from 'puppeteer'

declare module 'puppeteer' {
  interface Page extends OriginalPage {
    waitForSelector<Selector extends string>(
      selector: Selector,
      options?: WaitForSelectorOptions
    ): Promise<ElementHandle<NodeFor<Selector>>>
  }
}
