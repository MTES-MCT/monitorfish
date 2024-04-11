import { editSideWindowPriorNotification } from './utils'

context('Side Window > Prior Notification Card > Card', () => {
  it('Should display a corrected message as expected', () => {
    editSideWindowPriorNotification(`L'ANCRE`)

    // Title
    cy.contains(`PNO < 12 M - SEGMENT(S) INCONNU(S)`).should('be.visible')
    cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')

    // Message Header
    cy.contains(`PNO`).should('be.visible')
    cy.contains(`Préavis (notification de retour au port)`).should('be.visible')
    cy.contains(`MESSAGE CORRIGÉ`).should('be.visible')

    // Message Body
    cy.contains(`Vannes (FRVNE)`).should('be.visible')
    cy.contains(`Débarquement (LAN)`).should('be.visible')
    cy.contains(`BATHYBATES FEROX (BHX)`).should('be.visible')
    cy.contains(`32.5 kg`).should('be.visible')
  })

  it('Should display a successfully acknowledged message as expected', () => {
    editSideWindowPriorNotification(`BARS`)

    // Title
    cy.contains(`PNO ≥ 12 M - CHALUT DE FOND EN EAU PROFONDE ≥100 MM`).should('be.visible')
    cy.contains(`DES BARS (CFR104)`).should('be.visible')

    // Message Header
    cy.contains(`PNO`).should('be.visible')
    cy.contains(`Préavis (notification de retour au port)`).should('be.visible')

    // Message Body
    cy.getDataCy('LogbookMessage-successful-acknowledgement-icon').should('be.visible')
    cy.contains(`Saint-Malo (FRSML)`).should('be.visible')
    cy.contains(`Débarquement (LAN)`).should('be.visible')
    cy.contains(`MORUE COMMUNE (CABILLAUD) (COD)`).should('be.visible')
    cy.contains(`25 kg`).should('be.visible')
  })

  it('Should display a failed acknowledged message as expected', () => {
    editSideWindowPriorNotification(`CALAMARO`)

    // Title
    cy.contains(`PNO ≥ 12 M - SEGMENT(S) INCONNU(S)`).should('be.visible')
    cy.contains(`CALAMARO (CFR105)`).should('be.visible')

    // Message Header
    cy.contains(`PNO`).should('be.visible')
    cy.contains(`Préavis (notification de retour au port)`).should('be.visible')

    // Message Body
    cy.getDataCy('LogbookMessage-failed-acknowledgement-icon').should('be.visible')
    cy.contains(`Saint-Malo (FRSML)`).should('be.visible')
    cy.contains(`Débarquement (LAN)`).should('be.visible')
    cy.contains(`BAUDROIE (ANF)`).should('be.visible')
    cy.contains(`150 kg`).should('be.visible')
  })
})
