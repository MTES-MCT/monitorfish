import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import dayjs from 'dayjs'

import { editSideWindowPriorNotification } from './utils'
import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

context('Side Window > Logbook Prior Notification Form > Form', () => {
  it('Should update a logbook prior notification', () => {
    // Reset
    const operationDate = dayjs().subtract(6, 'hours').toISOString()
    cy.request('PUT', `/bff/v1/prior_notifications/logbook/FAKE_OPERATION_115?operationDate=${operationDate}`, {
      body: {
        authorTrigram: null,
        note: null
      }
    })

    // Given
    editSideWindowPriorNotification(`MER À BOIRE`, 'FAKE_OPERATION_115')

    cy.intercept('PUT', `/bff/v1/prior_notifications/logbook/FAKE_OPERATION_115?operationDate=*`).as(
      'updateLogbookPriorNotification'
    )

    cy.get('[name="note"]').should('have.value', '')
    cy.get('[name="authorTrigram"]').should('have.value', '')

    // When
    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")
    cy.fill('Par', 'ABC')

    cy.wait('@updateLogbookPriorNotification')

    // Then, the PDF is deleted
    cy.get('.Element-Button').contains('Télécharger').parent().should('be.disabled')

    // The note is saved
    editSideWindowPriorNotification(`MER À BOIRE`, 'FAKE_OPERATION_115')

    cy.get('[name="note"]').should('have.value', "Un point d'attention.")
    cy.get('[name="authorTrigram"]').should('have.value', 'ABC')

    // Reset
    cy.request('PUT', `/bff/v1/prior_notifications/logbook/FAKE_OPERATION_115?operationDate=${operationDate}`, {
      body: {
        authorTrigram: null,
        note: null
      }
    })
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

  it('Should verify and send a logbook prior notification', () => {
    cy.intercept(
      'POST',
      `/bff/v1/prior_notifications/FAKE_OPERATION_112_COR_ORPHAN/verify_and_send?isManuallyCreated=false&operationDate=*`
    ).as('verifyAndSendPriorNotification')

    editSideWindowPriorNotification(`LE POISSON AMBULANT`, 'FAKE_OPERATION_112_COR_ORPHAN')

    cy.clickButton('Diffuser')

    cy.wait('@verifyAndSendPriorNotification').then(verifyAndSendInterception => {
      if (!verifyAndSendInterception.response) {
        assert.fail('`verifyAndSendInterception.response` is undefined.')
      }

      const updatedPriorNotification = verifyAndSendInterception.response.body

      assert.deepInclude(updatedPriorNotification, {
        state: PriorNotification.State.PENDING_SEND
      })

      cy.contains('Diffusion en cours')

      // -----------------------------------------------------------------------
      // List

      cy.clickButton('Fermer')
      cy.fill('Rechercher un navire', 'LE POISSON AMBULANT')

      cy.getTableRowById('FAKE_OPERATION_112_COR_ORPHAN').find('span[title="Diffusion en cours"]').should('be.visible')
    })
  })

  it('Should download a logbook prior notification as a PDF document', () => {
    // Given
    editSideWindowPriorNotification(`L'OM DU POISSON`, 'FAKE_OPERATION_106')

    // Spy on the window.open method
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen')
    })

    // When
    cy.clickButton('Télécharger')

    // Verify that window.open was called with the correct URL
    cy.get('@windowOpen').should('be.calledWith', '/api/v1/prior_notifications/pdf/FAKE_OPERATION_106', '_blank')
  })

  it('Should invalidate a logbook prior notification', () => {
    // Given
    openSideWindowPriorNotificationListAsSuperUser()
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
    cy.fill('Rechercher un navire', 'ANCRE')

    cy.getTableRowById('FAKE_OPERATION_109_COR').find('[title="Préavis invalidé"]').should('not.exist')

    cy.getTableRowById('FAKE_OPERATION_109_COR').clickButton('Éditer le préavis')
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    // When
    cy.clickButton('Invalider le préavis')
    cy.clickButton('Confirmer l’invalidation')

    // Then
    cy.get('.Wrapper').contains('Invalidé')
    cy.get('[title="Invalider le préavis"]').should('not.exist')

    cy.clickButton('Fermer')

    cy.getTableRowById('FAKE_OPERATION_109_COR').find('[title="Préavis invalidé"]').should('exist')
  })
})
