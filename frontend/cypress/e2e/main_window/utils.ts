export function openVesselBySearch(vesselName: string, index?: number) {
  cy.get('*[data-cy^="VesselSearch-input"]', { timeout: 10000 }).eq(index ?? 0).type(vesselName)
  cy.wait(400)
  cy.get('*[data-cy^="VesselSearch-item"]', { timeout: 10000 }).eq(0).click()
  cy.wait(200)
  if (!index) {
    // We assume that the first search input is the map vessel input that trigger the vessel sidebar
    cy.getDataCy('vessel-sidebar').should('be.visible')
  }
}
