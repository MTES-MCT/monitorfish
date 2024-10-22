export function goToMainWindowAndOpenControlUnit(controlUnitId: number) {
  cy.login('superuser')
  cy.visit(`/`)

  cy.clickButton('Liste des unités de contrôle')
  cy.getDataCy('ControlUnitListDialog-control-unit').filter(`[data-id="${controlUnitId}"]`).forceClick().wait(250)
}
