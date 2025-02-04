import dayjs from 'dayjs'

import { openVesselBySearch } from '../utils'

context('Vessel sidebar controls buttons', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(2000)
  })

  it('Control buttons should be disabled When vessel has no positions', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]').type('MALOTRU')
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.get('*[data-cy^="vessel-sidebar"]').should('be.visible')

    // When
    cy.get('*[data-cy="show-all-fishing-activities-on-map"]').should('have.attr', 'disabled')
    cy.get('*[data-cy="trigger-hide-other-vessels-from-sidebar"]').should('have.attr', 'disabled')
    cy.get('*[data-cy="animate-to-track"]').should('have.attr', 'disabled')
    // The positions button is not disabled
    cy.get('*[data-cy="vessel-track-depth-selection"]').should('not.have.attr', 'disabled')
  })

  it('Vessel track depth Should be changed', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]').should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click()
    cy.fill('Afficher la piste VMS depuis', '3 jours')
    cy.wait(500)

    // Then
    cy.get('[data-id="5"] > td').eq(2).contains('0 nds')

    // And click on a position to zoom in
    cy.get('[data-id="5"] > td').eq(2).trigger('pointermove', { force: true, pointerId: 1 })
    cy.get('[data-id="5"] > td').eq(2).click({
      force: true
    })

    // The table should be sorted in ascending datetime order
    cy.get('.Table-SimpleTable').contains('GDH').click()
    cy.get('[data-id="0"] > td').eq(2).contains('8.7 nds')
    cy.get('[data-id="0"] > td').eq(1).find('[title="Position au port"]').should('exist')
    cy.get('[data-id="0"] > td').eq(1).find('[title="Position manuelle (4h-report)"]').should('exist')
    cy.get('[data-id="0"] > td').eq(1).find('[title="Réseau CELLULAR"]').should('exist')
    cy.get('[data-id="0"] > td').eq(1).contains('CEL')
  })

  it('Vessel track Should be downloaded', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.get('*[data-cy^="vessel-search-item"]').eq(0).click()
    cy.wait(200)
    cy.get('*[data-cy^="vessel-sidebar"]').should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click()
    cy.fill('Afficher la piste VMS depuis', '3 jours')
    cy.wait(500)

    // When
    cy.clickButton('Exporter la piste')

    // Then
    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout

      return cy
        .readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should(
          'contains',
          'Nom,Marq. Ext.,C/S,MMSI,CFR,Pavillon,GDH (UTC),Latitude,Longitude,Cap,Vitesse,Au port,Type de réseau'
        )
        .should('contains', '"PHENOMENE","DONTSINK","CALLME","","FAK000999999"')
        .should('contains', '"45° 55′ 12″ N","008° 45′ 54″ W",13,8.7,"Oui","Cellulaire"')
    })
  })

  it('Vessel track dates Should be changed When walking in fishing trips', () => {
    // Given
    openVesselBySearch('Pheno')
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 10000 })

    // TODO Fix the check of dates entered in DateRanges
    // Then
    // cy.get('.rs-picker-toggle-value').contains('16-02-2019')
    // cy.get('.rs-picker-toggle-value').contains('15-10-2019')
    // cy.get('*[data-cy^="vessel-track-depth-three-days"]').should('not.have.class', 'rs-radio-checked')

    // Then, back to another trip depth of three days
    cy.fill('Afficher la piste VMS depuis', '3 jours')
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Vessel track dates Should be changed from the agenda', () => {
    const startDateAsDayjs = dayjs().subtract(1, 'day').hour(1).minute(2)
    const endDateAsDayjs = dayjs().hour(3).minute(4)

    // Given
    openVesselBySearch('Pheno')
    cy.getDataCy('vessel-sidebar').should('be.visible')

    // When
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('getPositions')
    cy.getDataCy('vessel-track-depth-selection').click()

    cy.get('input[aria-label="Jour de début"]').type(startDateAsDayjs.format('DD'))
    cy.get('input[aria-label="Mois de début"]').type(startDateAsDayjs.format('MM'))
    cy.get('input[aria-label="Année de début"]').type(startDateAsDayjs.format('YYYY'))
    cy.get('input[aria-label="Jour de fin"]').type(endDateAsDayjs.format('DD'))
    cy.get('input[aria-label="Mois de fin"]').type(endDateAsDayjs.format('MM'))
    cy.get('input[aria-label="Année de fin"]').type(endDateAsDayjs.format('YYYY'))

    // Then
    cy.wait('@getPositions').then(({ request }) => {
      expect(request.url).contains(encodeURIComponent(`${startDateAsDayjs.format('DD')}T00:00:00.000Z`))
      expect(request.url).contains(encodeURIComponent(`${endDateAsDayjs.format('DD')}T23:59:59.000Z`))
    })

    cy.wait(200)
    cy.get('[name="vessel-track-depth"]').should('have.value', '')
    cy.getDataCy('vessel-menu-fishing').click()
    cy.getDataCy('custom-dates-showed-text').contains(
      new RegExp(
        `Piste affichée du ${startDateAsDayjs.format('DD')}/\\d{2}/\\d{2} au ${endDateAsDayjs.format(
          'DD'
        )}/\\d{2}/\\d{2}`
      )
    )
  })

  it('Fishing activities Should be seen on the vessel track and showed from the map', () => {
    // Given
    cy.wait(50)
    openVesselBySearch('Pheno')
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 10000 })
    cy.fill('Afficher la piste VMS depuis', '3 jours')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 10000 })
    cy.intercept(
      'GET',
      'bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST'
    ).as('getLogbook')
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 10000 })
    cy.wait('@getLogbook')

    // Then
    cy.wait(200)
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy^="fishing-activity-name"]').eq(2).scrollIntoView().click({ force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('#OOF20191030059903').should('be.visible')
    cy.get('#OOF20190627059908').should('not.be.visible')

    // Hide fishing activities
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Vessel track Should fit the view box When I click on animate to track', () => {
    cy.cleanScreenshots(1)

    // Given
    openVesselBySearch('Pheno')
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="animate-to-track"]').click({ timeout: 10000 })
    cy.wait(1500)

    // Then, the last position should be positioned in the bottom of the window
    cy.get('.VESSELS_POINTS')
      .eq(0)
      .toMatchImageSnapshot({
        imageConfig: {
          threshold: 0.05,
          thresholdType: 'percent'
        },
        screenshotConfig: {
          clip: { height: 840, width: 500, x: 210, y: 0 }
        }
      })

    cy.cleanScreenshots(1)
  })
})
