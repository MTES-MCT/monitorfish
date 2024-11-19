import { ALL_SEAFRONT_GROUP } from '@constants/seafront'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import dayjs from 'dayjs'

import { addManualSideWindowPriorNotification } from './utils'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'
import {
  editSideWindowPriorNotification,
  getPriorNotificationFakeResponse,
  getPriorNotificationSentMessagesFakeResponse,
  getPriorNotificationsFakeResponse
} from '../logbook_prior_notification_form/utils'
import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

context('Side Window > Manual Prior Notification Form > Behavior', () => {
  it('Should ask for confirmation before closing form when manual prior notification form is dirty', () => {
    const { utcDateTupleWithTime: arrivalDateTupleWithTime } = getUtcDateInMultipleFormats(
      customDayjs().add(2, 'hours').startOf('minute').toISOString()
    )

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('VesselSearch-input').type('PAGEOT JO')
    cy.getDataCy('VesselSearch-item').first().click()
    cy.wait(500)

    cy.clickButton('Fermer')
    cy.contains('Abandon de préavis').should('be.visible')
    cy.clickButton('Annuler')

    cy.clickButton('Fermer le formulaire')
    cy.contains('Abandon de préavis').should('be.visible')
    cy.clickButton('Annuler')

    cy.getDataCy('SideWindowCard-overlay').click()
    cy.contains('Abandon de préavis').should('be.visible')
    cy.clickButton('Annuler')

    // Opening another side window menu and coming back to the prior notification list
    // should restore the opened form, its values and its dirty state:

    cy.clickButton('Missions et contrôles')
    cy.getDataCy(`side-window-sub-menu-${ALL_SEAFRONT_GROUP}`).click()
    cy.contains('Toutes les missions').should('be.visible')

    cy.clickButton('Préavis de débarquement')
    cy.contains('Tous les préavis').should('be.visible')
    cy.contains('AJOUTER UN NOUVEAU PRÉAVIS').should('be.visible')
    cy.getDataCy('VesselSearch-input').should('have.value', 'PAGEOT JO')

    cy.clickButton('Fermer')
    cy.contains('Abandon de préavis').should('be.visible')
    cy.clickButton('Annuler')

    cy.clickButton('Fermer le formulaire')
    cy.contains('Abandon de préavis').should('be.visible')
    cy.clickButton('Annuler')

    cy.getDataCy('SideWindowCard-overlay').click()
    cy.contains('Abandon de préavis').should('be.visible')
    cy.clickButton('Annuler')

    // Saving the form should reset the dirty state (creation):

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill("équivalentes à celles de l'arrivée au port", true)
    cy.fill("Port d'arrivée", 'Vannes')
    cy.fill('Espèces à bord et à débarquer', 'AAX')
    cy.fill('Poids (AAX)', 25)
    cy.fill('Engins utilisés', ['OTP'], { index: 1 })
    cy.fill('Zone globale de capture', '21.4.T')

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification = createInterception.response.body

      cy.clickButton('Fermer')
      cy.get('.Component-Dialog').should('not.exist')
      cy.getDataCy('SideWindowCard-overlay').should('not.exist')

      editSideWindowPriorNotification('PAGEOT JO', createdPriorNotification.reportId)

      // Editing the form should make it dirty again (edition):

      cy.fill('Engins utilisés', ['TBN'], { index: 1 })

      cy.clickButton('Fermer')
      cy.contains('Abandon de préavis').should('be.visible')
      cy.clickButton('Annuler')

      cy.clickButton('Fermer le formulaire')
      cy.contains('Abandon de préavis').should('be.visible')
      cy.clickButton('Annuler')

      cy.getDataCy('SideWindowCard-overlay').click()
      cy.contains('Abandon de préavis').should('be.visible')
      cy.clickButton('Annuler')

      // Saving the form should reset the dirty state (edition):

      cy.clickButton('Enregistrer')

      cy.clickButton('Fermer')
      cy.get('.Component-Dialog').should('not.exist')
      cy.getDataCy('SideWindowCard-overlay').should('not.exist')
    })
  })

  it('Should enable and disable manual prior notification save and send buttons depending on form dirtiness', () => {
    const commonFakeParams = {
      isManuallyCreated: true,
      updatedAt: dayjs().toISOString()
    }

    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications?*'
      },
      {
        body: getPriorNotificationsFakeResponse({
          ...commonFakeParams,
          state: PriorNotification.State.VERIFIED_AND_SENT
        })
      }
    ).as('getFakePriorNotifications')
    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000?*'
      },
      {
        body: getPriorNotificationFakeResponse({
          ...commonFakeParams,
          state: PriorNotification.State.VERIFIED_AND_SENT
        })
      }
    ).as('getFakePriorNotification')

    openSideWindowPriorNotificationListAsSuperUser()
    cy.wait('@getFakePriorNotifications')
    cy.clickButton('Éditer le préavis')
    cy.wait('@getFakePriorNotification')

    cy.get('button').contains('Enregistrer').parent().should('be.disabled')
    cy.get('button').contains('Diffusé').parent().should('be.disabled')

    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")

    cy.get('button').contains('Enregistrer').parent().should('be.enabled')
    cy.get('button').contains('Diffusé').parent().should('be.disabled')

    cy.intercept(
      {
        method: 'GET',
        times: 2,
        url: '/bff/v1/prior_notifications?*'
      },
      {
        body: getPriorNotificationsFakeResponse({
          ...commonFakeParams,
          state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
        })
      }
    ).as('getFakePriorNotifications')
    cy.intercept(
      {
        method: 'GET',
        times: 2,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000?*'
      },
      {
        body: getPriorNotificationFakeResponse({
          ...commonFakeParams,
          state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
        })
      }
    ).as('getFakePriorNotification')
    cy.intercept(
      {
        method: 'PUT',
        times: 1,
        url: '/bff/v1/prior_notifications/manual/00000000-0000-4000-0000-000000000000'
      },
      {
        body: getPriorNotificationFakeResponse({
          ...commonFakeParams,
          state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
        })
      }
    ).as('updatePriorNotification')

    cy.clickButton('Enregistrer')
    cy.wait('@updatePriorNotification')
    cy.wait('@getFakePriorNotification')
    // TODO Not sure why there are two requests here (1min polling?): investigate for potential performance issue.
    cy.wait('@getFakePriorNotifications')
    cy.wait('@getFakePriorNotifications')

    cy.get('button').contains('Enregistrer').parent().should('be.disabled')
    cy.get('button').contains('Diffuser').parent().should('be.enabled')

    cy.fill("Points d'attention identifiés par le CNSP", "Un nouveau point d'attention.")

    cy.get('button').contains('Enregistrer').parent().should('be.enabled')
    cy.get('button').contains('Diffuser').parent().should('be.disabled')
  })

  it("Should show a banner, freeze the manual prior notification form and button when it's in pending send", () => {
    editSideWindowPriorNotification(`VIVA L'ITALIA`, '00000000-0000-4000-0000-000000000005')

    cy.get('.Component-Banner').contains(`Le préavis est en cours de diffusion.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')

    cy.contains('button', 'Enregistrer').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })

  it("Should show a banner, freeze the manual prior notification form and button when it's in pending auto-send", () => {
    editSideWindowPriorNotification(`DOS FIN`, '00000000-0000-4000-0000-000000000002')

    cy.get('.Component-Banner').contains(`Le préavis est en cours d’envoi aux unités qui l’ont demandé.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')

    cy.contains('button', 'Enregistrer').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })

  it('Should recalculate BFT total weight in a manual prior notification', () => {
    addManualSideWindowPriorNotification()

    cy.fill('Espèces à bord et à débarquer', 'AAX')
    cy.fill('Poids (AAX)', 25)
    cy.fill('Espèces à bord et à débarquer', 'BFT')

    cy.fill('Poids (BF1)', 40)

    cy.get('[id="fishingCatches[1].weight"]').should('have.value', '40')

    cy.fill('Poids (BF1)', 30)

    cy.get('[id="fishingCatches[1].weight"]').should('have.value', '30')
    cy.fill('Poids (BF1)', undefined)

    cy.get('[id="fishingCatches[1].weight"]').should('have.value', '0')

    cy.fill('Poids (BF1)', 20)
    cy.fill('Poids (BF2)', 30)

    cy.get('[id="fishingCatches[1].weight"]').should('have.value', '50')

    cy.fill('Poids (BF3)', 40)

    cy.get('[id="fishingCatches[1].weight"]').should('have.value', '90')

    cy.fill('Poids (BF3)', undefined)

    cy.get('[id="fishingCatches[1].weight"]').should('have.value', '50')
  })

  // Non-regression test
  // https://github.com/MTES-MCT/monitorfish/issues/3683
  it('Should create a manual prior notification Zero, remove a specy and calculate BFT total weight', () => {
    const { utcDateTupleWithTime: arrivalDateTupleWithTime } = getUtcDateInMultipleFormats(
      customDayjs().add(2, 'hours').startOf('minute').toISOString()
    )

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('VesselSearch-input').type('PHENOMENE')
    cy.getDataCy('VesselSearch-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill("équivalentes à celles de l'arrivée au port", true)
    cy.fill("Port d'arrivée", 'Vannes')
    cy.fill('Zone globale de capture', '21.4.T')

    cy.fill('Espèces à bord et à débarquer', 'SWO')
    cy.fill('Espèces à bord et à débarquer', 'BFT')

    cy.fill('Engins utilisés', ['OTP'], { index: 1 })

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification')

    cy.contains('.Element-SingleTag', 'SWO – ESPADON').find('button').click()

    cy.contains('SWO – ESPADON').should('not.exist')

    cy.fill('Poids (BF1)', 40)

    cy.get('[id="fishingCatches[0].weight"]').should('have.value', '40')

    cy.fill('Poids (BF2)', 30)

    cy.get('[id="fishingCatches[0].weight"]').should('have.value', '70')

    cy.fill('Poids (BF3)', 20)

    cy.get('[id="fishingCatches[0].weight"]').should('have.value', '90')
  })

  it('Should behave as expected when a manual prior norification is sent, failed to be sent, resent and successfully sent', () => {
    // -------------------------------------------------------------------------
    // Superuser opens a prior notification in edit mode

    const initialFakeParams = {
      isManuallyCreated: true,
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
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000?*'
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
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000/sent_messages'
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

    const pendingSendFakeParams = {
      isManuallyCreated: true,
      state: PriorNotification.State.PENDING_SEND,
      updatedAt: dayjs().toISOString()
    }

    cy.intercept(
      {
        method: 'POST',
        times: 1,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000/verify_and_send?*'
      },
      {
        body: getPriorNotificationFakeResponse(pendingSendFakeParams)
      }
    ).as('verifyAndSendFakePriorNotification')
    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000?*'
      },
      {
        body: getPriorNotificationFakeResponse(pendingSendFakeParams)
      }
    ).as('getFakePriorNotification')

    cy.clickButton('Diffuser')
    cy.wait('@verifyAndSendFakePriorNotification')
    // Use case should trigger a tag invalidation
    cy.wait('@getFakePriorNotification')

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
      isManuallyCreated: true,
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
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000?*'
      },
      {
        body: getPriorNotificationFakeResponse(failedSendFakeParams)
      }
    ).as('getFakePriorNotification')
    cy.intercept(
      {
        method: 'GET',
        times: 2,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000/sent_messages'
      },
      {
        body: failedSentMessagesFakeResponse
      }
    ).as('getFakePriorNotificationSentMessages2')

    cy.wait('@getFakePriorNotification')
    // Fingerprint has changed which should trigger refetching
    cy.wait('@getFakePriorNotificationSentMessages2')

    // -------------------------------------------------------------------------
    // Superuser opens the prior notification sent messages

    cy.clickButton('Voir les détails de la diffusion du préavis', { withoutScroll: true })

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
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000/verify_and_send?*'
      },
      {
        body: getPriorNotificationFakeResponse({
          isManuallyCreated: true,
          state: PriorNotification.State.PENDING_SEND,
          updatedAt: dayjs().toISOString()
        })
      }
    ).as('verifyAndSendFakePriorNotification')

    cy.clickButton('Diffuser')

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
      isManuallyCreated: true,
      state: PriorNotification.State.VERIFIED_AND_SENT,
      updatedAt: dayjs().toISOString()
    }

    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000?*'
      },
      {
        body: getPriorNotificationFakeResponse(verifiedAndSentFakeParams)
      }
    ).as('getFakePriorNotification')
    cy.intercept(
      {
        method: 'GET',
        times: 1,
        url: '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000000/sent_messages'
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
    // Fingerprint has changed which should trigger refetching
    cy.wait('@getFakePriorNotificationSentMessages3')

    // -------------------------------------------------------------------------
    // Superuser opens the prior notification sent messages

    cy.clickButton('Voir les détails de la diffusion du préavis', { withoutScroll: true })

    cy.contains('Vérifié et diffusé').should('be.visible')
    cy.contains('Unité 1 (Organisation 1)').should('be.visible')
    cy.contains('Unité 2 (Organisation 2)').should('be.visible')
    cy.contains('Unité 3 (Organisation 3)').should('be.visible')
    cy.contains('Préavis diffusé avec succès à tous les contacts.')
    cy.contains(
      'Échec de la diffusion pour tous les contacts: unite3@organisation3.gouv.fr, unite2@organisation2.gouv.fr, unite1@organisation1.gouv.fr.'
    )
  })

  // Non-regression test
  // https://github.com/MTES-MCT/monitorfish/issues/3683
  it('Should create a manual prior notification Zero, remove a specy and calculate BFT total weight', () => {
    const { utcDateTupleWithTime: arrivalDateTupleWithTime } = getUtcDateInMultipleFormats(
      customDayjs().add(2, 'hours').startOf('minute').toISOString()
    )

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('VesselSearch-input').type('PHENOMENE')
    cy.getDataCy('VesselSearch-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill("équivalentes à celles de l'arrivée au port", true)
    cy.fill("Port d'arrivée", 'Vannes')
    cy.fill('Zone globale de capture', '21.4.T')

    cy.fill('Espèces à bord et à débarquer', 'BFT')
    cy.fill('Espèces à bord et à débarquer', 'SWO')

    cy.fill('Engins utilisés', ['OTP'], { index: 1 })

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification')

    cy.contains('.Element-SingleTag', 'BFT – THON ROUGE').find('button').click()

    cy.contains('BFT – THON ROUGE').should('not.exist')

    cy.fill('Poids (SWO)', 10)

    cy.get('[id="fishingCatches[0].weight"]').should('have.value', '10')
  })
})
