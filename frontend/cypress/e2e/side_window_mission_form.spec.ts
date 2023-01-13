/// <reference types="cypress" />

import { SideWindowMenuKey } from 'src/features/SideWindow/constants'

context('Mission Form', () => {
  beforeEach(() => {
    cy.visit('/side_window').wait(500)
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }
    cy.clickButton(SideWindowMenuKey.MISSION_LIST).click()
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }
    cy.clickButton('Ajouter une nouvelle mission')
  })

  it('Should enable or disable under JDP checkbox depending on other field values', () => {
    const getHasMissionUnderJdpTypeCheckbox = () =>
      cy.get('label').contains('Mission sous JDP').find('input[type="checkbox"]')

    getHasMissionUnderJdpTypeCheckbox().should('be.disabled')

    cy.fill('Intentions principales de mission', ['Pêche'])

    getHasMissionUnderJdpTypeCheckbox().should('be.enabled')

    cy.fill('Intentions principales de mission', ['Env', 'Autre'])

    getHasMissionUnderJdpTypeCheckbox().should('be.disabled')

    cy.fill('Ordre de mission', 'Oui')

    getHasMissionUnderJdpTypeCheckbox().should('be.enabled')

    cy.fill('Ordre de mission', 'Non')

    getHasMissionUnderJdpTypeCheckbox().should('be.disabled')
  })

  it('Should add and remove a unit', () => {
    cy.clickButton('Ajouter une autre unité')

    cy.get('label').contains('Administration 2').should('exist')

    cy.clickButton('Supprimer cette unité', { index: 1 })

    cy.get('label').contains('Administration 2').should('not.exist')
  })
  /*
  it('Should add and remove a zone', () => {
    cy.clickButton('Ajouter une zone de mission')

    cy.get('div').contains('Polygone dessiné').should('exist')

    cy.clickButton('Supprimer cette zone')

    cy.get('div').contains('Polygone dessiné').should('not.exist')
  }) */

  // it('Should send the expected data to the API', () => {
  //   cy.fill('Type de mission', 'Mer')
  //   cy.fill('Intentions principales de mission', ['Pêche'])
  //   cy.fill('Mission sous JDP', true)
  //   cy.clickButton('Ajouter une autre unité')
  //   cy.clickButton('Ajouter une zone de mission')
  //   cy.fill('CACEM : orientations, observations', 'Une note.')
  //   cy.fill('CNSP : orientations, observations', 'Une autre note.')
  //   cy.fill('Ouvert par', 'Nemo')
  //   cy.fill('Clôturé par', 'Doris')
  //   cy.clickButton('Enregistrer')
  // })
})
