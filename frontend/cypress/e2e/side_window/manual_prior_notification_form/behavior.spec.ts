import { ALL_SEAFRONT_GROUP } from '@constants/seafront'

import { addManualSideWindowPriorNotification } from './utils'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'
import { editSideWindowPriorNotification } from '../logbook_prior_notification_form/utils'

context('Side Window > Manual Prior Notification Form > Behavior', () => {
  it('Should ask for confirmation before closing form when manual prior notification form is dirty', () => {
    const { utcDateTupleWithTime: arrivalDateTupleWithTime } = getUtcDateInMultipleFormats(
      customDayjs().add(2, 'hours').startOf('minute').toISOString()
    )

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('PAGEOT JO', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()
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
    cy.contains('AJOUTER UN NOUVEAU PRÉAVIS (< 12 M)').should('be.visible')
    cy.getDataCy('vessel-search-input').should('have.value', 'PAGEOT JO')

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
    cy.fill('Zone de pêche', '21.4.T')
    cy.fill('Saisi par', 'ABC')

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

  it("Should show a banner, freeze the manual prior notification form and button when it's in pending send", () => {
    editSideWindowPriorNotification(`VIVA L'ITALIA`, '00000000-0000-4000-0000-000000000005')

    cy.get('.Component-Banner').contains(`Le préavis est en cours de diffusion.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')
    cy.get('input[name=authorTrigram]').should('have.attr', 'readonly')

    cy.contains('button', 'Enregistrer').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })

  it("Should show a banner, freeze the manual prior notification form and button when it's in pending auto-send", () => {
    editSideWindowPriorNotification(`DOS FIN`, '00000000-0000-4000-0000-000000000002')

    cy.get('.Component-Banner').contains(`Le préavis est en cours d’envoi aux unités qui l’ont demandé.`)

    cy.get('textarea[name=note]').should('have.attr', 'readonly')
    cy.get('input[name=authorTrigram]').should('have.attr', 'readonly')

    cy.contains('button', 'Enregistrer').should('be.disabled')
    cy.contains('button', 'Diffuser').should('be.disabled')
  })
})
