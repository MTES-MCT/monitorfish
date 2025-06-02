import type {Coordinate} from "ol/coordinate";

export function getViewCenter(): Cypress.Chainable<Coordinate | undefined> {
  return cy.window().its('olTestUtils')
    .invoke('getViewCenter')
}
