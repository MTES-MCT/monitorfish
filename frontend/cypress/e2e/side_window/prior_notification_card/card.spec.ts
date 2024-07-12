import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

import { openSideWindowPriorNotification } from './utils'
import { openSideWindowPriorNotificationList } from '../prior_notification_list/utils'

context('Side Window > Prior Notification Card > Card', () => {
  it('Should display a corrected message as expected', () => {
    openSideWindowPriorNotification(`L'ANCRE`)

    // Title
    cy.contains(`Préavis navire < 12 M`).should('be.visible')
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

  it('Should display a non-editable message for a non-super user', () => {
    cy.intercept('/bff/v1/authorization/current', { statusCode: 401 }).as('getIsSuperUser')
    openSideWindowPriorNotification(`POISSON PAS NET`, false)
    cy.wait('@getIsSuperUser')

    // Title
    cy.contains(`Préavis navire < 12 M`).should('be.visible')
    cy.contains(`POISSON PAS NET (CFR112)`).should('be.visible')

    // Message Header
    cy.contains(`Préavis (notification de retour au port) – navire sans JPE`).should('be.visible')

    // Message Body
    cy.contains(`Filets soulevés portatifs (LNP)`).should('be.visible')
  })

  it('Should display a successfully acknowledged message as expected', () => {
    openSideWindowPriorNotification(`BARS`)

    // Title
    cy.contains(`Préavis navire ≥ 12 M`).should('be.visible')
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
    openSideWindowPriorNotification(`CALAMARO`)

    // Title
    cy.contains(`Préavis navire ≥ 12 M`).should('be.visible')
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

  it('Should refresh the list when the opened prior notification data differs from its entry in the current list', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109?isManuallyCreated=false'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotification(`L'ANCRE`)

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.PriorNotificationDetail = interception.response!.body
      const updatedPriorNotificationDetailStub: PriorNotification.PriorNotificationDetail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109'
      }

      openSideWindowPriorNotificationList()
      cy.fill('Rechercher un navire', `L'ANCRE`)

      cy.intercept('GET', url, { body: updatedPriorNotificationDetailStub }).as('getUpdatedPriorNotification')
      cy.intercept('GET', '/bff/v1/prior_notifications?*').as('getPriorNotifications')

      cy.clickButton('Éditer le préavis')

      cy.wait('@getUpdatedPriorNotification')
      cy.wait('@getPriorNotifications')

      cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('be.visible')
    })
  })

  it('Should display a warning banner and refresh the list when the opened prior notification has been deleted', () => {
    const url = '/bff/v1/prior_notifications/FAKE_OPERATION_109?isManuallyCreated=false'

    cy.intercept({
      method: 'GET',
      times: 1,
      url
    }).as('getOriginalPriorNotification')

    openSideWindowPriorNotification(`L'ANCRE`)

    cy.wait('@getOriginalPriorNotification').then(interception => {
      const originalPriorNotificationDetail: PriorNotification.PriorNotificationDetail = interception.response!.body
      const deletedPriorNotificationDetailStub: PriorNotification.PriorNotificationDetail = {
        ...originalPriorNotificationDetail,
        fingerprint: '109.1109.2109',
        logbookMessage: {
          ...originalPriorNotificationDetail.logbookMessage,
          isDeleted: true
        }
      }

      openSideWindowPriorNotificationList()
      cy.fill('Rechercher un navire', `L'ANCRE`)

      cy.intercept('GET', url, { body: deletedPriorNotificationDetailStub }).as('getDeletedPriorNotification')
      cy.intercept('GET', '/bff/v1/prior_notifications?*').as('getPriorNotifications')

      cy.clickButton('Éditer le préavis')

      cy.wait('@getDeletedPriorNotification')
      cy.wait('@getPriorNotifications')

      // The warning banner should be displayed
      cy.contains(`Ce préavis a été supprimé (entre temps).`).should('be.visible')
      // The card should be closed
      cy.contains(`L'ANCRE SÈCHE (CFR106)`).should('not.exist')
    })
  })

  it('Should verify and send a prior notification', () => {
    openSideWindowPriorNotification(`LE POISSON AMBULANT`)

    cy.intercept('POST', `/bff/v1/prior_notifications/FAKE_OPERATION_111/verify_and_send?isManuallyCreated=false`).as(
      'verifyAndSendPriorNotification'
    )

    cy.clickButton('Diffuser')

    cy.wait('@verifyAndSendPriorNotification').then(verifyAndSendInterception => {
      if (!verifyAndSendInterception.response) {
        assert.fail('`verifyAndSendInterception.response` is undefined.')
      }

      const updatedPriorNotification = verifyAndSendInterception.response.body

      assert.deepInclude(updatedPriorNotification, {
        state: PriorNotification.State.PENDING_SEND
      })

      cy.contains('En cours de diffusion')

      // -----------------------------------------------------------------------
      // List

      cy.clickButton('Fermer')
      cy.fill('Rechercher un navire', 'LE POISSON AMBULANT')

      cy.getTableRowById('FAKE_OPERATION_111' as unknown as number)
        .find('span[title="En cours de diffusion"]')
        .should('be.visible')
    })
  })

  it('Should update a note and delete the current PDF', () => {
    // Given
    openSideWindowPriorNotification(`CALAMARO`)
    cy.get('*[name="note"]').should('have.value', '')

    // When
    cy.intercept('PUT', `/bff/v1/prior_notifications/FAKE_OPERATION_108/note`).as('updatePriorNotificationNote')
    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")
    cy.get('*[name="note"]').should('have.value', "Un point d'attention.")
    cy.wait('@updatePriorNotificationNote')

    // Then, the PDF is deleted
    cy.get('.Element-Button').contains('Télécharger (Document non généré)')

    // The note is saved
    openSideWindowPriorNotification(`CALAMARO`)
    cy.get('*[name="note"]').should('have.value', "Un point d'attention.")
  })

  it('Should download a pdf document', () => {
    // Given
    openSideWindowPriorNotification(`COURANT MAIN PROFESSEUR`)

    // Spy on the window.open method
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen')
    })

    // When
    cy.clickButton('Télécharger')

    // Verify that window.open was called with the correct URL
    cy.get('@windowOpen').should('be.calledWith', '/bff/v1/prior_notifications/FAKE_OPERATION_102/pdf', '_blank')
  })
})
