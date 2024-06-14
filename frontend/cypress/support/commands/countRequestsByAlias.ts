const STORE = {}

/**
 * This function will count and return the number of requests made by Cypress with the given alias.
 *
 * @example
 * ```ts
 * cy.wait('@myRequest')
 * cy.countRequestByAlias('@myRequest').should('eq', 1)
 * ```
 */
export function countRequestsByAlias(alias: string): Cypress.Chainable<number> {
  return cy.get(alias).then(interception => {
    if (!STORE[alias]) {
      STORE[alias] = []
    }

    if (interception) {
      STORE[alias].push(interception)
    }

    return STORE[alias].length
  })
}
