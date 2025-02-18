import { editBackOfficePriorNotificationSubscriber } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'

context('BackOffice > Prior Notification Form > Form', () => {
  it('Should add, upgrade, downgrade and remove a port subscription', () => {
    cy.intercept('PUT', '/bff/v1/prior_notification_subscribers/10484').as('updatePriorNotificationSubscriber')

    editBackOfficePriorNotificationSubscriber(10484)

    cy.get('td:visible:contains("Nice")').should('have.length', 0)

    // -------------------------------------------------------------------------
    // Add port subscription

    cy.fill('Ajouter un port de diffusion partielle', 'Nice')

    cy.wait('@updatePriorNotificationSubscriber').then(updateInterception1 => {
      if (!updateInterception1.response) {
        assert.fail('`updateInterception1.response` is undefined.')
      }

      const updatedPriorNotificationSubscriber1: PriorNotificationSubscriber.Subscriber =
        updateInterception1.response.body

      assert.deepEqual(updatedPriorNotificationSubscriber1.portSubscriptions, [
        { controlUnitId: 10484, hasSubscribedToAllPriorNotifications: false, portLocode: 'FRNCE', portName: 'Nice' }
      ])

      cy.get('td:visible:contains("Nice")').should('have.length', 1)
      cy.get('td:visible:contains("Nice")')
        .parent()
        .find('input[name="hasSubscribedToAllPriorNotifications"]')
        .should('not.be.checked')

      // -------------------------------------------------------------------------
      // Upgrade partial port subscription to full one

      cy.fill('tous les préavis', true)

      cy.wait('@updatePriorNotificationSubscriber').then(updateInterception2 => {
        if (!updateInterception2.response) {
          assert.fail('`updateInterception2.response` is undefined.')
        }

        const updatedPriorNotificationSubscriber2: PriorNotificationSubscriber.Subscriber =
          updateInterception2.response.body

        assert.deepEqual(updatedPriorNotificationSubscriber2.portSubscriptions, [
          { controlUnitId: 10484, hasSubscribedToAllPriorNotifications: true, portLocode: 'FRNCE', portName: 'Nice' }
        ])

        cy.get('td:visible:contains("Nice")').should('have.length', 1)
        cy.get('td:visible:contains("Nice")')
          .parent()
          .find('input[name="hasSubscribedToAllPriorNotifications"]')
          .should('be.checked')

        // -------------------------------------------------------------------------
        // Downgrade full port subscription to partial one

        cy.fill('tous les préavis', false)

        cy.wait('@updatePriorNotificationSubscriber').then(updateInterception3 => {
          if (!updateInterception3.response) {
            assert.fail('`updateInterception3.response` is undefined.')
          }

          const updatedPriorNotificationSubscriber3: PriorNotificationSubscriber.Subscriber =
            updateInterception3.response.body

          assert.deepEqual(updatedPriorNotificationSubscriber3.portSubscriptions, [
            { controlUnitId: 10484, hasSubscribedToAllPriorNotifications: false, portLocode: 'FRNCE', portName: 'Nice' }
          ])

          cy.get('td:visible:contains("Nice")').should('have.length', 1)
          cy.get('td:visible:contains("Nice")')
            .parent()
            .find('input[name="hasSubscribedToAllPriorNotifications"]')
            .should('not.be.checked')

          // -------------------------------------------------------------------------
          // Remove port subscription

          cy.get('td:visible:contains("Nice")')
            .eq(0)
            .parent()
            .clickButton("Désinscrire l'unité de tous les préavis liés à ce port")

          cy.get('.Component-Dialog').contains('Supprimer un port de diffusion').should('be.visible')

          cy.clickButton('Confirmer la suppression')

          cy.wait('@updatePriorNotificationSubscriber').then(updateInterception4 => {
            if (!updateInterception4.response) {
              assert.fail('`updateInterception4.response` is undefined.')
            }

            const updatedPriorNotificationSubscriber4: PriorNotificationSubscriber.Subscriber =
              updateInterception4.response.body

            assert.isEmpty(updatedPriorNotificationSubscriber4.portSubscriptions)

            cy.get('td:visible:contains("Nice")').should('have.length', 0)
          })
        })
      })
    })
  })

  it('Should add and remove a fleet segment subscription', () => {
    cy.intercept('PUT', '/bff/v1/prior_notification_subscribers/10484').as('updatePriorNotificationSubscriber')

    editBackOfficePriorNotificationSubscriber(10484)

    cy.get('td:visible:contains("MED01 (MED01)")').should('have.length', 0)

    // -------------------------------------------------------------------------
    // Add fleet segment subscription

    cy.fill('Ajouter un segment de flotte', 'MED01')

    cy.wait('@updatePriorNotificationSubscriber').then(updateInterception1 => {
      if (!updateInterception1.response) {
        assert.fail('`updateInterception1.response` is undefined.')
      }

      const updatedPriorNotificationSubscriber1: PriorNotificationSubscriber.Subscriber =
        updateInterception1.response.body

      assert.deepEqual(updatedPriorNotificationSubscriber1.fleetSegmentSubscriptions, [
        { controlUnitId: 10484, segmentCode: 'MED01', segmentName: 'MED01' }
      ])

      cy.get('td:visible:contains("MED01 (MED01)")').should('have.length', 1)

      // -------------------------------------------------------------------------
      // Remove fleet segment subscription

      cy.get('td:visible:contains("MED01 (MED01)")')
        .parent()
        .clickButton("Désinscrire l'unité de tous les préavis liés à ce segment de flotte")

      cy.get('.Component-Dialog').contains('Supprimer un segment des diffusions').should('be.visible')

      cy.clickButton('Confirmer la suppression')

      cy.wait('@updatePriorNotificationSubscriber').then(updateInterception2 => {
        if (!updateInterception2.response) {
          assert.fail('`updateInterception2.response` is undefined.')
        }

        const updatedPriorNotificationSubscriber3: PriorNotificationSubscriber.Subscriber =
          updateInterception2.response.body

        assert.isEmpty(updatedPriorNotificationSubscriber3.fleetSegmentSubscriptions)

        cy.get('td:visible:contains("MED01 (MED01)")').should('have.length', 0)
      })
    })
  })

  it('Should add and remove a vessel subscription', () => {
    cy.intercept('PUT', '/bff/v1/prior_notification_subscribers/10484').as('updatePriorNotificationSubscriber')

    editBackOfficePriorNotificationSubscriber(10484)

    cy.get('td:visible:contains("PHENOMENE")').should('have.length', 0)

    // -------------------------------------------------------------------------
    // Add vessel subscription

    cy.getDataCy('VesselSearch-input').type('PHENOMENE')
    cy.getDataCy('VesselSearch-item').first().click()

    cy.wait('@updatePriorNotificationSubscriber').then(updateInterception1 => {
      if (!updateInterception1.response) {
        assert.fail('`updateInterception1.response` is undefined.')
      }

      const updatedPriorNotificationSubscriber1: PriorNotificationSubscriber.Subscriber =
        updateInterception1.response.body

      assert.deepEqual(updatedPriorNotificationSubscriber1.vesselSubscriptions, [
        {
          controlUnitId: 10484,
          vesselCallSign: 'CALLME',
          vesselCfr: 'FAK000999999',
          vesselExternalMarking: 'DONTSINK',
          vesselId: 1,
          vesselMmsi: '224103750',
          vesselName: 'PHENOMENE'
        }
      ])

      cy.get('td:visible:contains("PHENOMENE")').should('have.length', 1)

      // -------------------------------------------------------------------------
      // Remove vessel subscription

      cy.get('td:visible:contains("PHENOMENE")')
        .parent()
        .clickButton("Désinscrire l'unité de tous les préavis liés à ce navire")

      cy.get('.Component-Dialog').contains('Supprimer un navire des diffusions').should('be.visible')

      cy.clickButton('Confirmer la suppression')

      cy.wait('@updatePriorNotificationSubscriber').then(updateInterception2 => {
        if (!updateInterception2.response) {
          assert.fail('`updateInterception2.response` is undefined.')
        }

        const updatedPriorNotificationSubscriber3: PriorNotificationSubscriber.Subscriber =
          updateInterception2.response.body

        assert.isEmpty(updatedPriorNotificationSubscriber3.vesselSubscriptions)

        cy.get('td:visible:contains("PHENOMENE")').should('have.length', 0)
      })
    })
  })
})
