import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import dayjs from 'dayjs'

import {
  getPriorNotificationFakeResponse,
  getPriorNotificationsFakeResponse,
  editSideWindowPriorNotification,
  getPriorNotificationSentMessagesFakeResponse
} from './utils'
import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

context('Side Window > Logbook Prior Notification Form > Behavior', () => {
  it("Should show a banner, freeze the logbook prior notification form and button when it's in pending send", () => {
    editSideWindowPriorNotification(`LEVE NEDERLAND`, 'FAKE_OPERATION_105')

    cy.get('.Component-Banner').contains(`Le préavis est en cours de diffusion.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')

    cy.contains('button', 'Télécharger').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })

  it('Should behave as expected when a logbook prior norification is sent, failed to be sent, resent and successfully sent', () => {
    // -------------------------------------------------------------------------
    // Superuser opens a prior notification in edit mode

    const initialFakeParams = {
      isManuallyCreated: false,
      state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE,
      updatedAt: dayjs().toISOString()
    }

    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications?*'
      },
      {
        body: getPriorNotificationsFakeResponse(initialFakeParams)
      }
    ).as('getFakePriorNotifications')
    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000?*'
      },
      {
        body: getPriorNotificationFakeResponse(initialFakeParams)
      }
    ).as('getFakePriorNotification')

    openSideWindowPriorNotificationListAsSuperUser()
    cy.wait('@getFakePriorNotifications')
    cy.clickButton('Éditer le préavis')
    cy.wait('@getFakePriorNotification')

    // -------------------------------------------------------------------------
    // Superuser opens the prior notification sent messages

    cy.intercept(
      {
        method: 'GET',
        times: 2,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000/sent_messages'
      },
      {
        body: []
      }
    ).as('getFakePriorNotificationSentMessages1')

    cy.clickButton('Voir les détails de la diffusion du préavis', { withoutScroll: true })
    cy.wait('@getFakePriorNotificationSentMessages1')

    cy.contains('Hors vérification').should('be.visible')
    cy.contains('Aucun message n’a été envoyé pour ce préavis.').should('be.visible')

    // -------------------------------------------------------------------------
    // Superuser sends the prior notification

    cy.intercept(
      {
        method: 'POST',
        times: 1,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000/verify_and_send?*'
      },
      {
        body: getPriorNotificationFakeResponse({
          isManuallyCreated: false,
          state: PriorNotification.State.PENDING_SEND,
          updatedAt: dayjs().toISOString()
        })
      }
    ).as('verifyAndSendFakePriorNotification')

    cy.clickButton('Diffuser')
    cy.wait('@verifyAndSendFakePriorNotification')

    // -------------------------------------------------------------------------
    // Superuser opens the prior notification sent messages

    cy.clickButton('Voir les détails de la diffusion du préavis', { withoutScroll: true })
    cy.wait('@getFakePriorNotificationSentMessages1')

    cy.contains('Le préavis est en cours de diffusion.').should('be.visible')
    cy.clickButton('Masquer')
    cy.contains('Diffusion en cours').should('be.visible')
    cy.contains('Aucun message n’a été envoyé pour ce préavis.').should('be.visible')

    // -------------------------------------------------------------------------
    // Frontend automatically polls the prior notification 5s later
    // and Backend API returns the prior notification as failed to be sent

    const failedSendFakeParams = {
      isManuallyCreated: false,
      state: PriorNotification.State.FAILED_SEND,
      updatedAt: dayjs().toISOString()
    }
    const failedSentMessagesFakeResponse = getPriorNotificationSentMessagesFakeResponse({
      length: 3,
      numberOfFailedMessages: 3,
      sentAt: dayjs().subtract(35, 'seconds').toISOString()
    })

    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000?*'
      },
      {
        body: getPriorNotificationFakeResponse(failedSendFakeParams)
      }
    ).as('getFakePriorNotification')
    cy.intercept(
      {
        method: 'GET',
        times: 2,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000/sent_messages'
      },
      {
        body: failedSentMessagesFakeResponse
      }
    ).as('getFakePriorNotificationSentMessages2')

    cy.wait('@getFakePriorNotification')

    // -------------------------------------------------------------------------
    // The prior notification sent message list is now updated with an error

    cy.wait('@getFakePriorNotificationSentMessages2')

    cy.contains('Échec de diffusion').should('be.visible')
    cy.contains('Unité 1 (Organisation 1)').should('be.visible')
    cy.contains('Unité 2 (Organisation 2)').should('be.visible')
    cy.contains('Unité 3 (Organisation 3)').should('be.visible')
    cy.contains(
      'Échec de la diffusion pour tous les contacts: unite3@organisation3.gouv.fr, unite2@organisation2.gouv.fr, unite1@organisation1.gouv.fr.'
    )

    // -------------------------------------------------------------------------
    // Superuser resends the prior notification

    cy.intercept(
      {
        method: 'POST',
        times: 1,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000/verify_and_send?*'
      },
      {
        body: getPriorNotificationFakeResponse({
          isManuallyCreated: false,
          state: PriorNotification.State.PENDING_SEND,
          updatedAt: dayjs().toISOString()
        })
      }
    ).as('verifyAndSendFakePriorNotification')

    cy.clickButton('Diffuser')
    cy.wait('@verifyAndSendFakePriorNotification')

    // -------------------------------------------------------------------------
    // Superuser opens the prior notification sent messages

    cy.clickButton('Voir les détails de la diffusion du préavis', { withoutScroll: true })
    cy.wait('@getFakePriorNotificationSentMessages2')

    cy.contains('Le préavis est en cours de diffusion.').should('be.visible')
    cy.clickButton('Masquer')
    cy.contains('Diffusion en cours').should('be.visible')
    cy.contains('Unité 1 (Organisation 1)').should('be.visible')
    cy.contains('Unité 2 (Organisation 2)').should('be.visible')
    cy.contains('Unité 3 (Organisation 3)').should('be.visible')
    cy.contains(
      'Échec de la diffusion pour tous les contacts: unite3@organisation3.gouv.fr, unite2@organisation2.gouv.fr, unite1@organisation1.gouv.fr.'
    )

    // -------------------------------------------------------------------------
    // Frontend automatically polls the prior notification 5s later
    // and Backend API returns the prior notification as failed to be sent

    const verifiedAndSentFakeParams = {
      isManuallyCreated: false,
      state: PriorNotification.State.VERIFIED_AND_SENT,
      updatedAt: dayjs().toISOString()
    }

    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000?*'
      },
      {
        body: getPriorNotificationFakeResponse(verifiedAndSentFakeParams)
      }
    ).as('getFakePriorNotification')
    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/FAKE_OPERATION_000/sent_messages'
      },
      {
        body: [
          ...failedSentMessagesFakeResponse,
          ...getPriorNotificationSentMessagesFakeResponse({
            length: 3,
            numberOfFailedMessages: 0,
            sentAt: dayjs().toISOString()
          })
        ]
      }
    ).as('getFakePriorNotificationSentMessages3')

    cy.wait('@getFakePriorNotification')

    // -------------------------------------------------------------------------
    // The prior notification sent message list is now updated with a new successful send (and the previous failed one)

    cy.wait('@getFakePriorNotificationSentMessages3')

    cy.contains('Vérifié et diffusé').should('be.visible')
    cy.contains('Unité 1 (Organisation 1)').should('be.visible')
    cy.contains('Unité 2 (Organisation 2)').should('be.visible')
    cy.contains('Unité 3 (Organisation 3)').should('be.visible')
    cy.contains('Préavis diffusé avec succès à tous les contacts.')
    cy.contains(
      'Échec de la diffusion pour tous les contacts: unite3@organisation3.gouv.fr, unite2@organisation2.gouv.fr, unite1@organisation1.gouv.fr.'
    )
  })
})
