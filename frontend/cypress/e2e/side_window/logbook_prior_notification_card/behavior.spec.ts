import { editSideWindowPriorNotification } from '../logbook_prior_notification_form/utils'

context('Side Window > Logbook Prior Notification Form > Behavior', () => {
  it("Should show a banner, freeze the logbook prior notification form and button when it's in pending send", () => {
    editSideWindowPriorNotification(`DES BARS`, 'FAKE_OPERATION_107')

    cy.get('.Component-Banner').contains(`Le préavis est en cours de diffusion.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')
    cy.get('input[name=authorTrigram]').should('have.attr', 'readonly')

    cy.contains('button', 'Télécharger').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })
})
