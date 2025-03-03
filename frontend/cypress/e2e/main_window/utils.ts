export function openVesselBySearch(vesselName: string) {
  cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type(vesselName)
  cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
  cy.wait(200)
  cy.getDataCy('vessel-sidebar').should('be.visible')
}
