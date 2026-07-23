import type { Feature } from 'ol'

export function getFeaturesFromLayer(layerName: string): Cypress.Chainable<Array<Feature>> {
  return cy.window().its('olTestUtils').invoke('getFeaturesFromLayer', layerName)
}
