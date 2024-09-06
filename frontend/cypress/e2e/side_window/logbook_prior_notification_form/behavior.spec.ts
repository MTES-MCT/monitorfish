import dayjs from 'dayjs'

import { editSideWindowPriorNotification } from './utils'

context('Side Window > Logbook Prior Notification Form > Behavior', () => {
  it("Should show a banner, freeze the logbook prior notification form and button when it's in pending send", () => {
    editSideWindowPriorNotification(`LEVE NEDERLAND`, 'FAKE_OPERATION_105')

    cy.get('.Component-Banner').contains(`Le préavis est en cours de diffusion.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')
    cy.get('input[name=authorTrigram]').should('have.attr', 'readonly')

    cy.contains('button', 'Télécharger').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })

  it('Should not update the logbook prior notification before the form is filled', () => {
    cy.intercept('PUT', '/bff/v1/prior_notifications/logbook/FAKE_OPERATION_116*', cy.spy().as('updateForm'))

    editSideWindowPriorNotification(`LE MARIN`, 'FAKE_OPERATION_116')

    cy.contains(`LE MARIN D'EAU DOUCE (CFR111)`).should('be.visible')

    cy.get('@updateForm').should('not.have.been.called')

    cy.fill("Points d'attention identifiés par le CNSP", 'Une note')

    cy.get('@updateForm').should('have.been.calledOnce')

    // Reset
    const operationDate = dayjs().subtract(6, 'hours').toISOString()
    cy.request('PUT', `/bff/v1/prior_notifications/logbook/FAKE_OPERATION_116?operationDate=${operationDate}`, {
      body: {
        authorTrigram: null,
        note: null
      }
    })
  })
})
