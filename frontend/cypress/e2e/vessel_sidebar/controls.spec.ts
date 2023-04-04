/* eslint-disable no-undef */
/// <reference types="cypress" />

import { getDate } from '../../../src/utils'

context('Vessel sidebar controls tab', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Controls Should contain the controls summary and history', () => {
    // Given
    cy.get('.VESSELS').click(460, 480, { force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy="vessel-menu-controls"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-controls"]', { timeout: 10000 }).should('be.visible')

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy="vessel-controls-summary"]').contains('0Appréhension engin')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('1Appréhension espèce')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('1Déroutement')

    cy.get('*[data-cy="vessel-controls-summary-last-control"]').first().contains('Dernier contrôle en mer')
    cy.get('*[data-cy="vessel-controls-summary-last-control"]')
      .first()
      .contains(`Le ${date} (BGC Bastia), 6 infractions`)
    cy.get('*[data-cy="vessel-controls-summary-last-control"]').eq(1).contains('Dernier contrôle à quai')
    cy.get('*[data-cy="vessel-controls-summary-last-control"]')
      .eq(1)
      .contains("Le 18/01/2020 (Unité manquante), pas d'infraction")

    cy.get('*[data-cy="vessel-controls-year"]').first().contains('1 contrôle, 6 infractions')

    // When
    cy.get('*[data-cy="vessel-controls-year"]').first().click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="vessel-control-title"]').first().contains(`CONTRÔLE EN MER DU ${date}`)
    cy.get('*[data-cy="vessel-control"]')
      .first()
      .should('contain', '1. Infraction engin')
      .and('contain', 'Avec PV')
      .and('contain', 'NATINF 23581')
      .and('contain', 'Maille trop petite')

      .and('contain', '2. Infraction engin')
      .and('contain', 'Engin non conforme')
      .and('contain', 'Sans PV')
      .and('contain', 'NATINF 27724')

      .and('contain', '3. Infraction espèce')
      .and('contain', 'Sous taille de 8cm')
      .and('contain', 'Sans PV')
      .and('contain', 'NATINF 28346')
      .and('contain', 'Appréhension espèce')

      .and('contain', '4. Infraction JPE')
      .and('contain', 'Poids à bord MNZ supérieur de 50% au poids déclaré')
      .and('contain', 'Avec PV')
      .and('contain', 'NATINF 27689')

      .and('contain', '5. Infraction autre')
      .and('contain', 'Chalutage répété dans les 3 milles sur Piste VMS - confirmé de visu')
      .and('contain', 'Sans PV')
      .and('contain', 'NATINF 23588')

      .and('contain', '6. Infraction autre')
      .and('contain', "Absence d'équipement AIS à bord")
      .and('contain', 'Sans PV')
      .and('contain', 'NATINF 23584')

      .and('contain', 'Chaluts de fond à panneaux (OTB) – non contrôlé')
      .and('contain', 'Maillage déclaré 60 mm, non mesuré')

      .and('contain', 'Chaluts pélagiques à panneaux (OTM) – contrôlé')
      .and('contain', 'Maillage déclaré 60 mm, mesuré 52.8 mm')

      .and('contain', 'Observations')
      .and('contain', 'Commentaires post contrôle')
  })
})
