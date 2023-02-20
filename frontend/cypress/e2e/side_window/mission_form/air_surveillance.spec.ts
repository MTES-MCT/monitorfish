/// <reference types="cypress" />

import { Mission } from 'src/domain/types/mission'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'

context.skip('Side Window > Mission Form > Air Surveillance', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.AIR)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une surveillance aérienne')
  })

  it('Should fill the form and send the expected data to the API', () => {
    // -------------------------------------------------------------------------
    // Form

    // Objectifs du vol
    // TODO Add this test.

    // Segment ciblé
    // TODO Uncomment this test once monitor-ui Select (and MultiSelect) is fixed.
    // cy.fill('Segment ciblé (si pertinent)', 'ATL01)

    // Nb de navires survolés
    cy.fill('Nb de navires survolés', 15)

    // Observations générales sur le vol
    cy.fill('Observations générales sur le vol', 'Une observation générale sur le vol.')

    // Qualité du contrôle
    cy.fill('Observations sur le déroulé de la surveillance', 'Une observation sur le déroulé de la surveillance.')
    cy.fill('Fiche RETEX nécessaire', true)

    // Saisi par
    cy.fill('Saisi par', 'Marlin')

    // -------------------------------------------------------------------------
    // Request

    cy.intercept('POST', '/bff/v1/mission_actions', {
      // TODO This should be removed once the API works as expected.
      statusCode: 201
    }).as('createMissionAction')

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@createMissionAction').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      // console.log(JSON.stringify(interception.response))

      assert.deepInclude(interception.request.body, {})
      assert.isString(interception.request.body.actionDatetimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
