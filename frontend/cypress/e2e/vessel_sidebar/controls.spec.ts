/* eslint-disable no-undef */

import dayjs from 'dayjs'

import { getDate } from '../../../src/utils'

context('Vessel sidebar controls tab', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Controls Should contain the controls summary and history', () => {
    const currentMonth = dayjs().month()

    // Given
    cy.get('.VESSELS_POINTS').click(460, 460, { force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy="vessel-menu-controls"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-controls"]', { timeout: 10000 }).should('be.visible')

    // Then
    const date = getDate(new Date().toISOString())
    cy.get('*[data-cy="vessel-controls-summary"]').contains('0Appréhens. engin')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('1Appréhens. espèce')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('1Déroutement')

    cy.get('*[data-cy="vessel-controls-summary-last-control"]').first().contains('Dernier contrôle en mer')
    cy.get('*[data-cy="vessel-controls-summary-last-control"]')
      .first()
      .contains(`Le ${date} (BGC Bastia), 6 infractions`)
    cy.get('*[data-cy="vessel-controls-summary-last-control"]').eq(1).contains('Dernier contrôle à quai')
    cy.get('*[data-cy="vessel-controls-summary-last-control"]')
      .eq(1)
      .contains("Le 18/01/2020 (Unité manquante), pas d'infraction")

    cy.get('*[data-cy="vessel-controls-summary-law-reminders"]').first().contains('Rappels à la loi')
    cy.get('*[data-cy="vessel-controls-summary-law-reminders"]').first().contains('4 infractions sans PV')

    cy.get('*[data-cy="vessel-controls-year"]').eq(0).contains('1 contrôle, 6 infractions dont 3 sans PV')
    if (currentMonth === 0) {
      cy.get('*[data-cy="vessel-controls-year"]').eq(1).contains("1 contrôle, pas d'infraction")
      cy.get('*[data-cy="vessel-controls-year"]').eq(2).contains("1 contrôle, pas d'infraction")

      cy.get('*[data-cy="vessel-controls-year"]').eq(3).contains('1 contrôle, 1 infraction sans PV')
    } else {
      cy.get('*[data-cy="vessel-controls-year"]').eq(1).contains("2 contrôles, pas d'infraction")
      cy.get('*[data-cy="vessel-controls-year"]').eq(2).contains('1 contrôle, 1 infraction sans PV')
    }

    // When
    cy.get('*[data-cy="vessel-controls-year"]').first().click({ timeout: 10000 })

    // Check the control content displayed
    cy.get('*[data-cy="vessel-control-title"]').first().contains(`CONTRÔLE EN MER DU ${date}`)

    // The infractions label from natinfs should be rendered
    cy.get('[title="23584 - Défaut AIS"]').should('exist')

    cy.get('*[data-cy="vessel-control"]')
      .first()
      .should('contain', 'Appréhension espèce')

      .and('contain', '1. Infraction engin')
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

    // Close the opened year
    cy.get('*[data-cy="vessel-controls-year"]').eq(0).click({ timeout: 10000 })

    // Check the order of controls (in descending order)
    if (currentMonth === 0) {
      cy.get('*[data-cy="vessel-controls-year"]').eq(1).click({ timeout: 10000 })
      const yearBefore = dayjs().subtract(1, 'year')
      cy.get('*[data-cy="vessel-control-title"]').contains(`CONTRÔLE EN MER DU ${getDate(yearBefore.toISOString())}`)
      cy.get('*[data-cy="vessel-controls-year"]').eq(1).click({ timeout: 10000 })

      cy.get('*[data-cy="vessel-controls-year"]').eq(2).click({ timeout: 10000 })
      const yearBeforeMinusOneMonth = dayjs(yearBefore).subtract(1, 'month')
      cy.get('*[data-cy="vessel-control-title"]').contains(
        `CONTRÔLE EN MER DU ${getDate(yearBeforeMinusOneMonth.toISOString())}`
      )
    } else {
      cy.get('*[data-cy="vessel-controls-year"]').eq(1).click({ timeout: 10000 })
      const yearBefore = dayjs().subtract(1, 'year')
      cy.get('*[data-cy="vessel-control-title"]')
        .eq(0)
        .contains(`CONTRÔLE EN MER DU ${getDate(yearBefore.toISOString())}`)
      const yearBeforeMinusOneMonth = dayjs(yearBefore).subtract(1, 'month')
      cy.get('*[data-cy="vessel-control-title"]')
        .eq(1)
        .contains(`CONTRÔLE EN MER DU ${getDate(yearBeforeMinusOneMonth.toISOString())}`)
    }
  })

  it('A control mission Should be opened in the side window', () => {
    // Given
    cy.get('.VESSELS_POINTS').click(460, 460, { force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy="vessel-menu-controls"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-controls"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy="vessel-controls-year"]').first().click({ timeout: 10000 })

    // Click on Modify mission button
    cy.window().then(win => {
      cy.stub(win, 'open', () => {
        // eslint-disable-next-line no-param-reassign
        win.location.href = '/side_window'
      }).as('side_window')
    })
    cy.clickButton('Ouvrir le contrôle')
    cy.get('@side_window').should('be.called')
  })
})
