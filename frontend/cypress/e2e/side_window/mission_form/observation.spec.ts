/// <reference types="cypress" />

import { Mission } from 'src/domain/types/mission'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'

context.skip('Side Window > Mission Form > Observation', () => {
  beforeEach(() => {
    openSideWindowNewMission()

    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.clickButton('Ajouter')
    cy.clickButton('Ajouter une note libre')
  })

  it('Should fill the form and send the expected data to the API', () => {
    // -------------------------------------------------------------------------
    // Form

    // Autres observations
    cy.fill('Observations, commentaires...', 'Une observation.')

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
