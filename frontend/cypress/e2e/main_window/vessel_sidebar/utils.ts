import { faker } from '@faker-js/faker'

import type { Reporting } from '@features/Reporting/types'

/**
 * @returns Created reporting ID.
 */
export const createReportingFromVesselSidebar = (vesselName: string) => {
  cy.intercept('GET', '/bff/v1/vessels/reportings?*').as('getVesselReportings')
  cy.intercept('POST', '/bff/v1/reportings').as('createReporting')

  cy.loadPath('/#@-824534.42,6082993.21,8.70')

  cy.getDataCy('vessel-search-input').type(vesselName)
  cy.getDataCy('vessel-search-item').eq(0).click()

  cy.getDataCy('vessel-sidebar').should('be.visible')

  cy.getDataCy('vessel-menu-reporting').click()
  cy.getDataCy('vessel-reporting').should('be.visible')
  cy.wait('@getVesselReportings')

  cy.clickButton('Ouvrir un signalement')

  cy.fill('Titre', faker.word.words(3))
  cy.fill('Natinf', '23588')
  cy.fill('Saisi par', 'BOB')

  cy.clickButton('Valider')

  return cy.wait('@createReporting').then(createInterception => {
    if (!createInterception.response) {
      assert.fail('`createInterception.response` is undefined.')
    }

    const createdPriorNotification: Reporting.Reporting = createInterception.response.body

    return createdPriorNotification.id
  })
}

export const deleteReporting = (reportId: number) => {
  cy.request({
    method: 'DELETE',
    url: `/bff/v1/reportings/${reportId}`
  })
}

export function addAndCreateReportingWithinVesselSidebar() {
  cy.intercept('*reporting*').as('createReporting')

  cy.clickButton('Ouvrir un signalement')

  cy.fill('Origine', 'Unité')
  cy.fill("Choisir l'unité", 'OFB SD 56 (Office Français de la Biodiversité)')
  cy.fill('Nom et contact (numéro, mail…) de l’émetteur', 'Jean Bon (0612365896)')
  cy.fill('Titre', 'Sortie non autorisée')
  cy.fill('Description', "Ce navire ne devrait pas être en mer, il n'a plus de points sur son permis")
  cy.fill('Natinf', '2608')
  cy.fill('Saisi par', 'LTH')

  cy.clickButton('Valider')
  cy.wait('@createReporting')
}
