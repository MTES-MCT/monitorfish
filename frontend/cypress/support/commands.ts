import { isEmpty } from 'ramda'

function unquote (str: string): string {
  return str.replace(/(^")|("$)/g, '')
}

Cypress.Commands.add(
  'before',
  {
    prevSubject: 'element'
  },
  (el: JQuery<Element>, property: string): string => {
    if (!el[0]) {
      throw new Error('`el[0]` is undefined.')
    }

    const win = el[0].ownerDocument.defaultView
    if (!win) {
      throw new Error('`win` is null.')
    }

    const before = win.getComputedStyle(el[0], 'before')

    return unquote(before.getPropertyValue(property))
  }
)

Cypress.Commands.add('cleanScreenshots', (fromNumber: number): void => {
  cy.exec(`cd cypress/e2e/__image_snapshots__/ && find . | grep -P "[${fromNumber}-7]\\.png" | xargs -i rm {}\n`)
})

Cypress.Commands.add(
  'clickButton',
  (buttonText: string): Cypress.Chainable<JQuery<HTMLButtonElement>> => cy.get('button').contains(buttonText).click()
)
Cypress.Commands.add(
  'clickLink',
  (linkText: string): Cypress.Chainable<JQuery<HTMLAnchorElement>> => cy.get('a').contains(linkText).click()
)

/**
 * @description
 * Useful to close modals.
 */
Cypress.Commands.add('clickOutside', () => cy.get('body').click(0, 0))

/**
 * @example
 * ```ts
 *   cy.fill('Password', 'P422W0Rd')
 * ```
 */
Cypress.Commands.add('fill', (label: string, value: string): void => {
  const cypressLabelElement = cy.get('label').contains(label)
  if (!cypressLabelElement) {
    throw new Error(`Could not find label element with text "${label}".`)
  }

  cypressLabelElement.then(([labelElement]) => {
    if (!labelElement) {
      throw new Error(`Could not find label element with text "${label}".`)
    }

    // If the label has a for attribute, we can use it to find the input
    if (!isEmpty(labelElement.htmlFor)) {
      const cypressInputElement = cy.get(`#${labelElement.htmlFor}`)
      cypressInputElement.type(value)

      return cypressInputElement
    }

    // If the label has no for attribute, we can check if an input is within the label
    const cypressInputElement = cypressLabelElement.get('input')
    if (cypressInputElement) {
      cypressInputElement.type(value)

      return cypressInputElement
    }

    // If the label has no for attribute, we can check if a textarea is within the label
    const cypressTextareaElement = cypressLabelElement.get('textarea')
    if (cypressTextareaElement) {
      cypressTextareaElement.type(value)

      return cypressTextareaElement
    }

    throw new Error(`Could not find input or textarea with label "${label}".`)
  })
})
