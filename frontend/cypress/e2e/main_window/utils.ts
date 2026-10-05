export function openVesselBySearch(vesselName: string) {
  cy.get('*[data-cy^="VesselSearch-input"]', { timeout: 10000 }).eq(0).type(vesselName)
  // Until the search results are displayed, the list shows the last searched vessels (same item `data-cy`):
  // only pick from the search results
  cy.get('[data-cy="VesselSearch-results"] [data-cy^="VesselSearch-item"]', { timeout: 10000 }).eq(0).click()
  cy.wait(200)
  cy.getDataCy('vessel-sidebar').should('be.visible')
}
