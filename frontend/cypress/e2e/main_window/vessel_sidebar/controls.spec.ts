import dayjs from 'dayjs'

import { openVesselBySearch } from '../utils'

context('Vessel sidebar controls tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Controls Should contain the controls summary and history', () => {
    const currentMonth = dayjs().month()
    const currentYear = dayjs().year()

    // Given
    openVesselBySearch('Pheno')

    // When
    cy.get('*[data-cy="vessel-menu-controls"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-controls"]', { timeout: 10000 }).should('be.visible')

    // Then
    // Summary
    const date = dayjs().format('DD/MM/YYYY')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('0Appréhens. engin')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('1Appréhens. espèce')
    cy.get('*[data-cy="vessel-controls-summary"]').contains('1Déroutement')

    cy.get('*[data-cy="vessel-controls-summary-last-control"]').first().contains('Dernier contrôle en mer')
    cy.get('*[data-cy="vessel-controls-summary-last-control"]')
      .first()
      .contains(`Le ${date} (BGC Lorient - DF 36 Kan An Avel), 6 infractions`)
    cy.getDataCy('vessel-controls-summary-last-control').contains('Type inconnu / NATINF 23581')
    cy.getDataCy('vessel-controls-summary-last-control').contains('Type inconnu / NATINF 27724')
    cy.getDataCy('vessel-controls-summary-last-control').contains('Espèces en sous taille / sous poids / NATINF 28346')
    cy.getDataCy('vessel-controls-summary-last-control').contains('Type inconnu / NATINF 23588')
    cy.getDataCy('vessel-controls-summary-last-control').contains('Type inconnu / NATINF 23584')
    cy.getDataCy('vessel-controls-summary-last-control').contains('BMS (JPE) / NATINF 27689')

    cy.get('*[data-cy="vessel-controls-summary-last-control"]').eq(1).contains('Dernier contrôle à quai')
    cy.get('*[data-cy="vessel-controls-summary-last-control"]')
      .eq(1)
      .contains("Le 18/01/2020 (Unité manquante), pas d'infraction")

    cy.get('*[data-cy="vessel-controls-summary-law-reminders"]').first().contains('Rappels à la loi')
    cy.get('*[data-cy="vessel-controls-summary-law-reminders"]').first().contains('4 infractions sans PV')
    cy.getDataCy('vessel-controls-summary-law-reminders').contains('Type inconnu / NATINF 27724')
    cy.getDataCy('vessel-controls-summary-law-reminders').contains('Espèces en sous taille / sous poids / NATINF 28346')
    cy.getDataCy('vessel-controls-summary-law-reminders').contains('Type inconnu / NATINF 23584')

    // Years
    cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear}"]`).contains(
      '1 contrôle, 6 infractions dont 3 sans PV'
    )

    // Because date is set as "NOW - 1 YEAR - 1 MONTH", we might be in the first month of the year
    if (currentMonth === 0) {
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear - 1}"]`).contains(
        "1 contrôle, pas d'infraction"
      )

      cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear - 2}"]`).contains(
        "1 contrôle, pas d'infraction"
      )

      // The control date is hardcoded in the test data
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année 2021"]`).contains('1 contrôle, 1 infraction sans PV')
    } else {
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear - 1}"]`).contains(
        "2 contrôles, pas d'infraction"
      )

      // The control date is hardcoded in the test data
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année 2021"]`).contains('1 contrôle, 1 infraction sans PV')
    }

    // When
    cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear}"]`)
      .find('[data-cy="vessel-controls-year"]')
      .as('currentYearNode')
    cy.get(`@currentYearNode`).click({ timeout: 10000 })

    // Check the control content displayed
    cy.get('*[data-cy="vessel-control-title"]').first().contains(`CONTRÔLE EN MER DU ${date}`)

    // The infractions label from natinfs should be rendered
    cy.get('[title="Mesures techniques et de conservation - Espèces en sous taille / sous poids\n' +
      '28346 - Détention de produits de la pêche maritime et de l\'aquaculture marine de taille, calibre ou poids prohibe"]').should('exist')
    cy.get('[title="Famille inconnue - Type inconnu\n' +
      '23584 - Défaut AIS"]').should('exist')

    cy.get('*[data-cy="vessel-control"]')
      .first()
      .should('contain', 'Appréhension espèce')

      .and('contain', 'Infraction 1 : Famille inconnue')
      .and('contain', 'Avec PV')
      .and('contain', 'Type inconnu / NATINF 23581')
      .and('contain', 'Maille trop petite')

      .and('contain', 'Infraction 2 : Famille inconnue')
      .and('contain', 'Engin non conforme')
      .and('contain', 'Sans PV')
      .and('contain', 'Type inconnu / NATINF 27724')

      .and('contain', 'Infraction 3 : Mesures techniques et de conservation')
      .and('contain', 'Sous taille de 8cm')
      .and('contain', 'Sans PV')
      .and('contain', 'Espèces en sous taille / sous poids / NATINF 28346')

      .and('contain', 'Infraction 4 : Famille inconnue')
      .and('contain', 'Poids à bord MNZ supérieur de 50% au poids déclaré')
      .and('contain', 'Avec PV')
      .and('contain', 'Type inconnu / NATINF 23588')

      .and('contain', 'Infraction 5 : Famille inconnue')
      .and('contain', 'Chalutage répété dans les 3 milles sur Piste VMS - confirmé de visu')
      .and('contain', 'Sans PV')
      .and('contain', 'Type inconnu / NATINF 23584')

      .and('contain', 'Infraction 6 : Obligation de débarquement')
      .and('contain', "Absence d'équipement AIS à bord")
      .and('contain', 'Sans PV')
      .and('contain', 'BMS (JPE) / NATINF 27689')

      .and('contain', 'Chaluts de fond à panneaux (OTB) – non contrôlé')
      .and('contain', 'Maillage déclaré 60 mm, non mesuré')

      .and('contain', 'Chaluts pélagiques à panneaux (OTM) – contrôlé')
      .and('contain', 'Maillage déclaré 60 mm, mesuré 52.8 mm')

      .and('contain', 'Observations')
      .and('contain', 'Commentaires post contrôle')

    // Close the opened year
    cy.get('@currentYearNode').click({ timeout: 10000 })

    // Check the order of controls (in descending order)
    if (currentMonth === 0) {
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear - 1}"]`)
        .find('[data-cy="vessel-controls-year"]')
        .as('yearAgoNode')
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear - 2}"]`)
        .find('[data-cy="vessel-controls-year"]')
        .as('twoYearAgoNode')

      cy.get('@yearAgoNode').click({ timeout: 10000 })
      const yearBefore = dayjs().subtract(1, 'year')
      cy.get('*[data-cy="vessel-control-title"]').contains(`CONTRÔLE EN MER DU ${yearBefore.format('DD/MM/YYYY')}`)
      cy.get('@yearAgoNode').click({ timeout: 10000 })

      cy.get('@twoYearAgoNode').click({ timeout: 10000 })
      const yearBeforeMinusOneMonth = dayjs(yearBefore).subtract(1, 'month')
      cy.get('*[data-cy="vessel-control-title"]').contains(
        `CONTRÔLE EN MER DU ${dayjs(yearBeforeMinusOneMonth).format('DD/MM/YYYY')}`
      )
      cy.get('@twoYearAgoNode').click({ timeout: 10000 })
    } else {
      cy.get(`[data-cy="vessel-control-years"] > li[title="Année ${currentYear - 1}"]`)
        .find('[data-cy="vessel-controls-year"]')
        .as('yearAgoNode')

      cy.get('@yearAgoNode').click({ timeout: 10000 })
      const yearBefore = dayjs().subtract(1, 'year')
      cy.get('*[data-cy="vessel-control-title"]')
        .eq(0)
        .contains(`CONTRÔLE EN MER DU ${yearBefore.format('DD/MM/YYYY')}`)
      const yearBeforeMinusOneMonth = dayjs(yearBefore).subtract(1, 'month')
      cy.get('*[data-cy="vessel-control-title"]')
        .eq(1)
        .contains(`CONTRÔLE EN MER DU ${dayjs(yearBeforeMinusOneMonth).format('DD/MM/YYYY')}`)
      cy.get('@yearAgoNode').click({ timeout: 10000 })
    }
    /**
     * Display the vessel trip from the control
     */
    cy.get('@currentYearNode').click({ timeout: 10000 })
    cy.intercept(
      'GET',
      'bff/v1/vessels/logbook/find_by_dates?afterDateTime=*&beforeDateTime=*&internalReferenceNumber=FAK000999999&trackDepth=CUSTOM'
    ).as('getLogbook')
    cy.clickButton('Voir la marée du contrôle', { index: 0 })
    cy.wait('@getLogbook')
    cy.getDataCy('vessel-fishing').should('exist')
    cy.get('.Component-Banner').contains("Ce navire n'a pas envoyé de message JPE pendant cette période.")
    cy.get('[title="Paramétrer l\'affichage de la piste VMS"]').click()
    // The default track depth is empty
    cy.get('[name="vessel-track-depth"]').should('have.value', '')
  })

  it('A control mission Should be opened in the side window', () => {
    // Given
    openVesselBySearch('Pheno')

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
