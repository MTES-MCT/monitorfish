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

  it('Should attach and remove a document to logbook prior notification', () => {
    cy.intercept('GET', `/bff/v1/prior_notifications/FAKE_OPERATION_115/uploads`).as('getUploads')
    cy.intercept(
      'POST',
      `/bff/v1/prior_notifications/FAKE_OPERATION_115/uploads?isManualPriorNotification=false&operationDate=*`
    ).as('uploadDocument')
    cy.intercept('DELETE', `/bff/v1/prior_notifications/FAKE_OPERATION_115/uploads/*`).as('deleteDocument')

    editSideWindowPriorNotification(`MER À BOIRE`, 'FAKE_OPERATION_115')

    cy.wait('@getUploads')

    cy.fixture('sample.pdf').then(fileContent => {
      cy.get('input[type=file]').selectFile(
        {
          contents: Cypress.Buffer.from(fileContent),
          fileName: 'sample.pdf',
          mimeType: 'application/pdf'
        },
        {
          action: 'select',
          force: true
        }
      )

      cy.wait('@uploadDocument').then(() => {
        cy.wait('@getUploads').wait(500)

        cy.contains('.rs-uploader-file-item', 'sample.pdf')
          .find('.rs-uploader-file-item-btn-remove .rs-icon')
          .forceClick()

        cy.wait('@deleteDocument')
        cy.wait('@getUploads').wait(500)

        cy.contains('sample.pdf').should('not.exist')
      })
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
    cy.getDataCy('PriorNotificationCard-TagBar').contains('Invalidé')
    cy.get('[title="Invalider le préavis"]').should('not.exist')

    cy.clickButton('Fermer')

    cy.getTableRowById('FAKE_OPERATION_110').find('[title="Préavis invalidé"]').should('exist')
  })

  it('Should invalidate and duplicate a logbook prior notification', { retries: 0 }, () => {
    cy.intercept(
      'PUT',
      `/bff/v1/prior_notifications/FAKE_OPERATION_114/invalidate?isManuallyCreated=false&operationDate=*`
    ).as('invalidatePriorNotification')
    cy.intercept('GET', `/bff/v1/prior_notifications/FAKE_OPERATION_114?isManuallyCreated=false&operationDate=*`).as(
      'getPriorNotification'
    )

    openSideWindowPriorNotificationListAsSuperUser()
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
    cy.fill('Rechercher un navire', 'POISSON')

    cy.getTableRowById('FAKE_OPERATION_114').find('[title="Préavis invalidé"]').should('not.exist')

    cy.getTableRowById('FAKE_OPERATION_114').clickButton('Éditer le préavis')
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    cy.contains('button', 'Créer un préavis manuel à partir de ce préavis').should('be.disabled')

    cy.clickButton('Invalider le préavis')
    cy.clickButton('Confirmer l’invalidation')

    cy.wait('@invalidatePriorNotification')

    cy.getDataCy('PriorNotificationCard-TagBar').contains('Invalidé')
    cy.contains('button', 'Créer un préavis manuel à partir de ce préavis').should('be.enabled')

    cy.clickButton('Créer un préavis manuel à partir de ce préavis')

    cy.wait('@getPriorNotification')

    cy.contains('AJOUTER UN NOUVEAU PRÉAVIS').should('be.visible')
    cy.getDataCy('vessel-search-input').should('have.value', "LE POISSON D'AVRIL")
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('Débarquement').should('be.visible')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('Vannes (FRVNE)').should('be.visible')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('27.7.d').should('be.visible')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('ANF – BAUDROIE').should('exist')
    cy.get('input[id="fishingCatches[0].weight"]').should('have.value', '40')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('SOL – SOLE COMMUNE').should('exist')
    cy.get('input[id="fishingCatches[1].weight"]').should('have.value', '3')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('TUR – TURBOT').should('exist')
    cy.get('input[id="fishingCatches[2].weight"]').should('have.value', '16')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains("SCE – COQUILLE ST-JACQUES D'EUROPE").should('exist')
    cy.get('input[id="fishingCatches[3].weight"]').should('have.value', '27150')
    cy.getDataCy('ManualPriorNotificationForm-Body').contains('Dragues remorquées par bateau (DRB)').should('exist')

    cy.clickButton('Fermer')

    cy.getTableRowById('FAKE_OPERATION_114').find('[title="Préavis invalidé"]').should('exist')
  })

  it('Should download a logbook prior notification as a PDF document', { retries: 0 }, () => {
    cy.cleanDownloadedFiles()

    // Given
    editSideWindowPriorNotification(`L'OM DU POISSON`, 'FAKE_OPERATION_106')

    cy.intercept('GET', '/bff/v1/prior_notifications/FAKE_OPERATION_106/pdf').as('downloadPriorNotificationDocument')

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
