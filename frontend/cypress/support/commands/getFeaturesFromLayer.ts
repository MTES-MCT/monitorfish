import type {FeatureType} from "ol/format/WFS";

export function getFeaturesFromLayer(layerName: string): Cypress.Chainable<Array<FeatureType>> {
  return cy.window().its('olTestUtils')
    .invoke('getFeaturesFromLayer', layerName)
}
