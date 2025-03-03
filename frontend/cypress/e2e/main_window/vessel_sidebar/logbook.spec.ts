/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

context('Vessel sidebar logbook tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('FAR and DIS messages resume Should notify that all messages are not acknowledged', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('U_W0')
    cy.wait(50)
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-menu-fishing"]', { timeout: 10000 }).should('be.visible')

    // Then
    // FAR messages are not acknowledged
    cy.get('*[data-cy="vessel-fishing-resume-title"]')
      .eq(1)
      .contains('message non acquitté – aucune capture', { timeout: 10000 })
    // DIS messages are not acknowledged
    cy.get('*[data-cy="vessel-fishing-resume-title"]')
      .eq(3)
      .contains('message non acquitté – aucun rejet', { timeout: 10000 })

    cy.get('*[data-cy="fishing-resume-not-acknowledged-icon"]').should('have.length', 2)
  })

  it('Fishing Should contain the vessel ERS logbook messages', () => {
    cy.log('Fishing Should contain the vessel fishing resume')

    openVesselBySearch('Pheno')

    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-menu-fishing"]', { timeout: 10000 }).should('be.visible')

    cy.get('*[data-cy="Zones de la marée"]').contains('27.8.b, 27.8.c')
    cy.get('*[data-cy="Engin de la marée (FAR)"]').contains('Chaluts de fond à panneaux (OTB)')
    cy.get('*[data-cy="Majorité d\'espèces à bord"]').contains('Pélagique')
    cy.get('*[data-cy="Espèces cibles à bord"]').contains('NEP (≥ 20% du total des captures)')

    cy.get('*[data-cy="vessel-fishing-resume-title"]').eq(2).click({ timeout: 10000 })
    cy.get('*[data-cy="cps-message-resume"]').contains('DAUPHIN COMMUN (DCO)')
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains('1 message non acquitté')

    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains('1 message - 2256 kg pêchés au total')

    cy.log('See all messages')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 10000 })

    cy.get('*[data-cy="vessel-fishing-message"]').should('have.length', 13)

    cy.get('*[data-cy="vessel-fishing-message"]').eq(0).contains("Capture d'espèces protégées")
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(0).contains('DAUPHIN COMMUN (DCO)')
    cy.get('*[title="DAUPHIN COMMUN (DCO)"]').click()
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(0).contains('Temps à bord')
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(0).contains('40 minutes')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(1).contains('Départ')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(1).contains('Al Jazeera Port le 11/10/2019 à 01h40 (UTC)')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(2).contains("Sortie d'une zone d'effort")
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(2).contains('Message envoyé via e-sacapt')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(3).contains("Entrée dans une zone d'effort")

    cy.get('*[data-cy="vessel-fishing-message"]').eq(4).contains("Traversée d'une zone d'effort")

    cy.get('*[data-cy="vessel-fishing-message"]').eq(5).contains('Déclaration de capture')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(5).siblings().eq(1).contains('ANCIEN MESSAGE')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(6).contains("Déclaration d'inspection")
    cy.get('*[data-cy="vessel-fishing-message"]').eq(6).siblings().eq(1).contains('MESSAGE CORRIGÉ')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(7).contains('Fin de pêche')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(8).contains('Préavis (notification de retour au port)')
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(8).contains('MERLU NOIR DU CAP (HKC)')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(9).contains('Retour au port')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(10).contains('Déclaration de capture')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(10).siblings().eq(1).contains('MESSAGE CORRIGÉ')
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(10).contains('BONITE A DOS RAYE (BON)')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(11).contains('Déclaration de rejets')
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(11).contains('LANGOUSTINE (NEP)')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(12).contains('Débarquement')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(12).siblings().eq(1).contains('MESSAGE SUPPRIMÉ')
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(12).contains('BONITE A DOS RAYE (BON)')

    // Invalidated PNO message
    cy.getDataCy('vessel-fishing-previous-trip').click()
    cy.contains('Marée n°9463714').should('be.visible')
    cy.getDataCy('vessel-fishing-previous-trip').click()
    cy.contains('Marée n°9463713').should('be.visible')

    cy.getDataCy('vessel-fishing-message').eq(1).contains('Préavis (notification de retour au port)')
    cy.getDataCy('vessel-fishing-message').eq(1).siblings().eq(1).contains('MESSAGE INVALIDÉ')
  })

  it('Fishing Should contain the vessel FLUX logbook messages', () => {
    // Given
    openVesselBySearch('SOCRATE')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="vessel-fishing-message"]').should('have.length', 24)
    cy.get('*[data-cy="vessel-fishing-message"]').first().contains('Départ', { timeout: 10000 })
    cy.get('*[data-cy="vessel-fishing-message"]')
      .first()
      .contains('ESCAR le 06/05/2020 à 11h39 (UTC)', { timeout: 10000 })

    cy.get('*[data-cy="vessel-fishing-message"]').eq(4).contains('Déclaration de capture')
    cy.get('*[data-cy^="logbook-haul-number"]').should('have.length', 2)
  })

  it.only('Fishing activities Should be changed according to the actual trip When walking in fishing trips', () => {
    // Given
    openVesselBySearch('Pheno')
    cy.wait(200)
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ force: true, timeout: 10000 })
    cy.fill('Afficher la piste VMS depuis', '3 jours')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ force: true, timeout: 10000 })

    // When
    cy.wait(200)
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 10000 })
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('previousTripPositions')
    cy.wait(200)
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 10000 })

    // Then
    cy.wait('@previousTripPositions')
      .its('response.url')
      .should(
        'have.string',
        `/bff/v1/vessels/positions?afterDateTime=${encodeURIComponent('2019-02-16T21:05:00.000Z')}` +
          `&beforeDateTime=${encodeURIComponent('2019-10-15T13:01:00.000Z')}&externalReferenceNumber=DONTSINK&internalReferenceNumber=FAK000999999` +
          '&IRCS=CALLME&trackDepth=CUSTOM&vesselIdentifier=INTERNAL_REFERENCE_NUMBER'
      )

    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy="custom-dates-showed-text"]').contains('Piste affichée du 16/02/19 au 15/10/19')

    // Hide fishing activities
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 10000 })
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('nextTripPositions')
    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click({ timeout: 10000 })
    /**
     * Hours are modified before request, see `getDateRangeMinusFourHoursPlusOneHour()`
     */
    cy.wait('@nextTripPositions')
      .its('response.url')
      .should(
        'have.string',
        '/bff/v1/vessels/positions?afterDateTime=&beforeDateTime=' +
          '&externalReferenceNumber=DONTSINK&internalReferenceNumber=FAK000999999' +
          '&IRCS=CALLME&trackDepth=TWELVE_HOURS&vesselIdentifier=INTERNAL_REFERENCE_NUMBER'
      )
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
    // Go back to the default track depth
    cy.get('*[data-cy="custom-dates-showed-text"]').should('not.exist')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ force: true, timeout: 10000 })
    cy.get('[name="vessel-track-depth"]').should('have.value', 'TWELVE_HOURS')
  })

  it('Single fishing activity Should be seen on map When clicking on the position icon', () => {
    // Given
    openVesselBySearch('Pheno')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ force: true, timeout: 10000 })
    cy.fill('Afficher la piste VMS depuis', '3 jours')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ force: true, timeout: 10000 })

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 10000 })
    cy.scrollTo(0, 380)
    cy.get('*[data-cy^="show-fishing-activity"]').eq(8).parent().contains('Retour au port')
    cy.get('*[data-cy^="show-fishing-activity"]').eq(8).scrollIntoView().click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 1).eq(0).contains('RTP')

    // Then hide the fishing activity
    cy.get('*[data-cy^="hide-fishing-activity"]').eq(0).click({ timeout: 10000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Fishing trips Should be walkable', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]').click()
    cy.get('*[data-cy^="vessel-search-input"]').type('FR263454484')
    cy.wait(50)
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]').should('be.visible')
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.get('*[data-cy^="vessel-fishing"]').should('be.visible')
    cy.get('#tripNumber-describe').contains('Marée n°SRC-TRP-TTT20200506194051795')

    // Then
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 10000 })
    cy.get('#tripNumber-describe').contains('Marée n°20230087')

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 10000 })
    cy.get('#tripNumber-describe').contains('Marée n°20230086')

    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click({ timeout: 10000 })
    cy.get('#tripNumber-describe').contains('Marée n°20230087')

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 10000 })
    cy.get('#tripNumber-describe').contains('Marée n°20230086')

    cy.get('*[data-cy^="vessel-fishing-last-trip"]').click({ timeout: 10000 })
    cy.get('#tripNumber-describe').contains('Marée n°SRC-TRP-TTT20200506194051795')
  })

  it('Fishing trips Should be selected from the trips list', () => {
    cy.get('*[data-cy^="vessel-search-input"]').click()
    cy.get('*[data-cy^="vessel-search-input"]').type('FR263454484')
    cy.wait(50)
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]').should('be.visible')
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.get('*[data-cy^="vessel-fishing"]').should('be.visible')
    cy.get('#tripNumber-describe').contains('Marée n°SRC-TRP-TTT20200506194051795')

    cy.fill('Numéro de marée', 'Marée n°20230087')

    cy.get('#tripNumber-describe').contains('Marée n°20230087')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click()

    cy.log('Also in all logbook messages')
    cy.get('*[data-cy="LogbookMessage"]').should('have.length', 2)
    cy.fill('Filtrer les messages', 'DEP')
    cy.get('*[data-cy="LogbookMessage"]').should('have.length', 1)
    cy.fill('Filtrer les messages', undefined)

    cy.fill('Trier les messages', "Trier par date d'activité")

    cy.get('*[data-cy="LogbookMessage"]').eq(0).contains('Départ')
    cy.clickButton('Trier par date antéchronologique')
    cy.get('*[data-cy="LogbookMessage"]').eq(0).contains('Préavis')
    cy.clickButton('Trier par date chronologique')
    cy.get('*[data-cy="LogbookMessage"]').eq(0).contains('Départ')

    cy.fill('Numéro de marée', '20230086')
    cy.get('*[data-cy="LogbookMessage"]').should('have.length', 1)
    cy.get('*[data-cy="LogbookMessage"]').eq(0).contains('Débarquement')
  })
})
