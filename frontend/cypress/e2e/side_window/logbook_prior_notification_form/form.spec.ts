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

  it('Should invalidate a logbook prior notification', { retries: 0 }, () => {
    // Given
    openSideWindowPriorNotificationListAsSuperUser()
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
    cy.fill('Rechercher un navire', 'THON')

    cy.getTableRowById('FAKE_OPERATION_110').find('[title="Préavis invalidé"]').should('not.exist')

    cy.getTableRowById('FAKE_OPERATION_110').clickButton('Éditer le préavis')
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

    cy.getTableRowById('FAKE_OPERATION_110').find('[title="Préavis invalidé"]').should('exist')
  })

  it('Should download a logbook prior notification as a PDF document', { retries: 0 }, () => {
    cy.cleanDownloadedFiles()

    // Given
    editSideWindowPriorNotification(`COURANT MAIN PROFESSEUR`, 'FAKE_OPERATION_102')

    cy.intercept('GET', '/bff/v1/prior_notifications/FAKE_OPERATION_102/pdf').as('downloadPriorNotificationDocument')

    // When
    cy.clickButton('Télécharger')

    // Then
    cy.wait('@downloadPriorNotificationDocument').then(downloadInterception => {
      if (!downloadInterception.response) {
        assert.fail('`downloadInterception.response` is undefined.')
      }

      expect(downloadInterception.response.headers['content-type']).to.equal('application/pdf')
      expect(downloadInterception.response.headers['x-generation-date']).to.equal('2024-07-03T14:45:00Z')

      cy.getDownloadedFileContent(content => {
        content.should('match', /^%PDF-/)
      })
    })
  })
})
