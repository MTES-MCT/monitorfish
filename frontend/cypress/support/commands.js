import { isEmpty } from 'ramda'

/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/// <reference types="cypress" />

function unquote (str) {
  return str.replace(/(^")|("$)/g, '')
}

Cypress.Commands.add('cleanScreenshots', fromNumber => {
  cy.exec(`cd cypress/integration/__image_snapshots__/ && find . | grep -P "[${fromNumber}-7]\.png" | xargs -i rm {}\n`)
})

Cypress.Commands.add('clickButton', (buttonText) => cy.get('button').contains(buttonText).click())
Cypress.Commands.add('clickLink', (linkText) => cy.get('a').contains(linkText).click())

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
Cypress.Commands.add('fill', (label, value) => {
  const cypressLabelElement = cy.get('label').contains(label)

  cypressLabelElement.then(([labelElement]) => {
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

    throw new Error(`Could not find input or textarea with label ${label}`)
  })
})

/**
 * Must be chained after a `cy.get()`
 */
// Cypress.Commands.add('forceClick', {
//   prevSubject: true
// }, (cypressElement) => {
//   cypressElement.click({ force: true })

//   return cypressElement
// })

/**
 * Must be chained after a `cy.get()`
 */
// Cypress.Commands.add('forceType', {
//   prevSubject: true
// }, (cypressElement) => {
//   cypressElement.type({ force: true })

//   return cypressElement
// })

Cypress.Commands.add(
  'before',
  {
    prevSubject: 'element'
  },
  (el, property) => {
    const win = el[0].ownerDocument.defaultView
    const before = win.getComputedStyle(el[0], 'before')
    return unquote(before.getPropertyValue(property))
  }
)
