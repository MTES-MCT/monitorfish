// I have no idea why I have to add this dirty hack of setting an external variable
// instead of using a cleaner FP `.filter()`
// but real experience made me think it greatly improves results stability.

export function findElementBytext(
  selector: string,
  text: string,
  {
    fallbackSelector,
    index = 0,
    inElement
  }: Partial<{
    fallbackSelector: string
    inElement: HTMLElement
    index: number
  }> = {}
) {
  const trimmedText = text.trim()

  if (inElement) {
    let foundElement
    let foundElementIndex = 0
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    Cypress.$(inElement)
      .find(selector)
      // eslint-disable-next-line func-names
      .each(function (this: HTMLElement) {
        if (!foundElement && Cypress.$(this).text().trim() === trimmedText) {
          if (foundElementIndex < index) {
            foundElementIndex += 1

            return
          }

          foundElement = this
        }
      })
    if (!foundElement && fallbackSelector) {
      cy.log(`⚠️ Using fallback selector: "${fallbackSelector}"`)

      const foundElementByFallbackSelector = Cypress.$(inElement).find(fallbackSelector)

      return foundElementByFallbackSelector
    }

    return foundElement
  }

  let foundElement
  let foundElementIndex = 0
  // eslint-disable-next-line func-names, @typescript-eslint/no-unused-expressions
  Cypress.$(selector).each(function () {
    if (!foundElement && Cypress.$(this).text().trim() === trimmedText) {
      if (foundElementIndex < index) {
        foundElementIndex += 1

        return
      }

      foundElement = this
    }
  })
  if (!foundElement && fallbackSelector) {
    // eslint-disable-next-line no-console
    console.warn(`Using fallback selector: "${fallbackSelector}".`)

    const foundElementByFallbackSelector = Cypress.$(fallbackSelector)

    return foundElementByFallbackSelector
  }

  return foundElement
}
