import type { Interception } from 'cypress/types/net-stubbing'

const STORE: Record<string, string[]> = {}

/**
 * Count and return the number of requests made by Cypress with the given alias.
 *
 * @example
 * ```ts
 * // Reset the count of requests made with the alias '@myRequest'
 * cy.resetCountRequestsByAlias('@myRequest')
 *
 * // Check that no request has been made with the alias '@myRequest'
 * cy.countRequestByAlias('@myRequest', 1500).should('eq', 0)
 *
 * // Check that 2 requests have been made with the alias '@myRequest'
 * cy.wait('@myRequest')
 * cy.countRequestByAlias('@myRequest').should('eq', 2)
 * ```
 */
export function countRequestsByAlias(alias: string, waitForInMs: number = 0): Cypress.Chainable<number> {
  if (waitForInMs > 0) {
    cy.wait(waitForInMs)
  }

  return cy.get<Interception>(alias).then(interception => {
    if (!STORE[alias]) {
      STORE[alias] = []
    }

    const storedInterceptionIds = STORE[alias]!!
    if (interception && !storedInterceptionIds.includes(interception.id)) {
      storedInterceptionIds.push(interception.id)
      STORE[alias] = storedInterceptionIds
    }

    return storedInterceptionIds.length
  })
}

/**
 * Reset the count of requests made by Cypress with the given alias.
 */
export function resetCountRequestsByAlias(alias: string): void {
  STORE[alias] = []
}
