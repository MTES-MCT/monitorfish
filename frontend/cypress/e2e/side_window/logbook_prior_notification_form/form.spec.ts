import dayjs from 'dayjs'

import { editSideWindowPriorNotification } from '../manual_prior_notification_form/utils'

context('Side Window > Logbook Prior Notification Form > Form', () => {
  it('Should not update the form with a PUT request on first render', () => {
    cy.intercept('PUT', '/bff/v1/prior_notifications/logbook/FAKE_OPERATION_114*', cy.spy().as('updateForm'))

    editSideWindowPriorNotification(`LA MER À BOIRE`, 'FAKE_OPERATION_114')

    cy.contains(`LA MER À BOIRE (CFR110)`).should('be.visible')

    cy.get('@updateForm').should('not.have.been.called')

    cy.fill("Points d'attention identifiés par le CNSP", 'Une note')

    cy.get('@updateForm').should('have.been.calledOnce')

    // Reset
    cy.request('PUT', `/bff/v1/prior_notifications/logbook/FAKE_OPERATION_114?operationDate=${dayjs().toISOString()}`, {
      body: {
        authorTrigram: null,
        note: null
      }
    })
  })
})
