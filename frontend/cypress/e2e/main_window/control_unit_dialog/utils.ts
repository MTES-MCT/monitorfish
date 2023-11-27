export function goToMainWindowAndOpenControlUnit(controlUnitId: number) {
  cy.visit(`/`).wait(1000)

  cy.clickButton('Liste des unités de contrôle')
  cy.getDataCy('ControlUnitListDialog-control-unit').filter(`[data-id="${controlUnitId}"]`).forceClick().wait(250)
}
