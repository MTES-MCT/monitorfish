import { stubSideWindowOptions } from '../../support/commands'
import { hoverOrClickVesselByName } from '../../support/commands/hoverOrClickVesselByName'
import { WORLD_WIDTH_IN_METERS } from '../../support/commands/moveViewToWorldCopy'

const HALF_WORLD_WIDTH_IN_METERS = WORLD_WIDTH_IN_METERS / 2

// An overlay positioned on another world copy than the one displayed is thousands of pixels away.
function assertIsInsideViewport(selector: string) {
  cy.get(selector).should($element => {
    const element = $element[0]!
    const { bottom, left, right, top } = element.getBoundingClientRect()
    const { innerHeight, innerWidth } = element.ownerDocument.defaultView!

    expect(right).to.be.greaterThan(0)
    expect(left).to.be.lessThan(innerWidth)
    expect(bottom).to.be.greaterThan(0)
    expect(top).to.be.lessThan(innerHeight)
  })
}

function assertViewIsOnWorldCopy(offset: number) {
  cy.getViewCenter().should(center => {
    const worldIndex = Math.round(center![0]! / WORLD_WIDTH_IN_METERS)

    expect(worldIndex).to.equal(offset)
  })
}

function getLongitudesFromWkt(wkt: string): number[] {
  return (wkt.match(/-?\d+(\.\d+)?\s+-?\d+(\.\d+)?/g) ?? []).map(pair => Number(pair.split(/\s+/)[0]))
}

// Same retry as in reporting_map_form.spec.ts: a single hover sometimes lands before the WebGL hit-detection buffer is ready
function hoverReportingCopy(vesselName: string, attempt = 0): Cypress.Chainable {
  hoverOrClickVesselByName(vesselName, 'REPORTING', 'hover', 12, 1)

  return cy.get('body').then($body => {
    if ($body.find('[data-cy="reporting-overlay"]:visible').length > 0) {
      return cy.wrap($body)
    }
    if (attempt >= 10) {
      throw new Error(`Reporting overlay for "${vesselName}" was not displayed after ${attempt} hovers`)
    }

    cy.get('.REPORTING').trigger('pointermove', { clientX: 5, clientY: 5, force: true, pointerId: 1 })
    cy.wait(300)

    return hoverReportingCopy(vesselName, attempt + 1)
  })
}

context('Map world wrap', () => {
  beforeEach(() => {
    cy.login('superuser')
  })

  it('The map Should be panned across the antimeridian', () => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)

    // When centering east of the antimeridian, near Wallis-et-Futuna (185° E = 175° W)
    cy.window().then(win => {
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const { monitorfishMap } = win.olTestUtils
      monitorfishMap.getView().setCenter([(185 / 180) * HALF_WORLD_WIDTH_IN_METERS, -1500000])
      monitorfishMap.renderSync()
    })

    // Then the view is not clamped to the [-180°, 180°] extent
    cy.getViewCenter().should(center => {
      expect(center![0]).to.be.greaterThan(HALF_WORLD_WIDTH_IN_METERS)
    })

    // When hovering the map center
    cy.get('.VESSELS_POINTS').then($map => {
      const { height, left, top, width } = $map[0]!.getBoundingClientRect()
      cy.get('.VESSELS_POINTS').trigger('pointermove', {
        clientX: left + width / 2,
        clientY: top + height / 2,
        force: true,
        pointerId: 1
      })
    })

    // Then the cursor coordinates are within [-180°, 180°] (175° W, not 185° E)
    cy.contains('(DMS)')
      .invoke('text')
      .should('match', /17[45]° \d{2}′ \d{2}″ W/)
  })

  it('A vessel and its alert Should be displayed and selected on a wrapped world copy', () => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(6000)
    cy.moveViewToWorldCopy(1)

    // When hovering the vessel copy
    cy.hoverOrClickVesselByName('EN RÉPÉTER PÈRE', 'VESSELS_POINTS', 'hover', 0, 1)

    // Then the vessel card is displayed next to the hovered copy, with its alert
    cy.get('*[data-cy^="vessel-card-name"]').contains('EN RÉPÉTER PÈRE')
    cy.get('*[data-cy^="vessel-card-alert"]').contains('Chalutage dans les 3 milles')
    cy.get('*[data-cy^="vessel-card-longitude"]').contains('006° 30′ 22″ W')
    assertIsInsideViewport('*[data-cy^="vessel-card-name"]')

    // When clicking the vessel copy
    cy.hoverOrClickVesselByName('EN RÉPÉTER PÈRE', 'VESSELS_POINTS', 'click', 0, 1)

    // Then the vessel is selected and the view stays on the same world copy
    cy.get('*[data-cy="vessel-sidebar"]').should('be.visible')
    cy.wait(1500)
    assertViewIsOnWorldCopy(1)

    // And the track is displayed and hoverable on this world copy
    cy.window().then(win => {
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const { getFeaturesFromLayer, getPixelFromCoordinate, monitorfishMap } = win.olTestUtils
      const trackPoint = getFeaturesFromLayer('VESSEL_TRACK').find(
        feature => feature.getGeometry()?.getType() === 'Point'
      )
      expect(trackPoint, 'a track point').to.not.equal(undefined)

      const [x, y] = trackPoint.getGeometry().getCoordinates()
      const trackPointCopy = [x + WORLD_WIDTH_IN_METERS, y]
      monitorfishMap.getView().setCenter(trackPointCopy)
      monitorfishMap.renderSync()
      const pixel = getPixelFromCoordinate(trackPointCopy)
      const features = monitorfishMap.getFeaturesAtPixel(pixel, {
        hitTolerance: 5,
        layerFilter: layer => layer.get('code') === 'VESSEL_TRACK'
      })

      expect(features.length).to.be.greaterThan(0)

      // When hovering this track point copy
      const mapRect = monitorfishMap.getViewport().getBoundingClientRect()
      cy.get('.VESSELS_POINTS').trigger('pointermove', {
        clientX: Math.round(pixel[0] + mapRect.left),
        clientY: Math.round(pixel[1] + mapRect.top),
        force: true,
        pointerId: 1
      })
    })

    // Then the track point card is displayed next to the hovered copy
    assertIsInsideViewport('*[data-cy="vessel-track-card-longitude"]')
  })

  it('The vessel map menu Should be displayed next to the right-clicked vessel copy', () => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(5000)
    cy.moveViewToWorldCopy(1)

    // When right-clicking the same vessel as in vessel_track.spec.ts, on the next world copy
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })

    // Then
    assertIsInsideViewport('*[data-cy="add-vessel-to-favorites"]')
  })

  it('An alert reporting overlay Should be displayed next to the hovered reporting copy', () => {
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.visit('/#@-545000,6135000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)
    cy.clickButton('Signalements')
    cy.clickButton('Afficher les signalements')
    cy.wait(1000)
    cy.moveViewToWorldCopy(1)

    // When
    hoverReportingCopy('RENCONTRER VEILLER APPARTEMENT')

    // Then
    assertIsInsideViewport('[data-cy="reporting-overlay"]')
  })

  it('A reporting point drawn on a wrapped world copy Should be saved with WGS84 coordinates', () => {
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')
    cy.visit('/#@-545000,6135000,10.50')
    cy.wait('@displayReportings')
    cy.wait(3000)

    cy.clickButton('Signalements')
    cy.clickButton('Afficher les signalements')
    cy.clickButton('Créer un nouveau signalement INN')
    cy.get('input[name="reportingSource"][value="OTHER"]').click()
    cy.fill('Autres types de source', 'DIRM')
    cy.fill('Identité de l’émetteur', 'Jean Bon (0612365896)')

    // When the point is drawn on the next world copy
    cy.moveViewToWorldCopy(1)
    cy.clickButton('Ajouter un point')
    cy.wait(250)
    cy.get('body').click(150, 150)
    cy.wait(250)

    // Then the coordinates input shows the same place as on the main world
    cy.getDataCy('dms-coordinates-input')
      .invoke('val')
      .should('match', /N 00\d° \d{2}′ \d{2}″ W$/)
    cy.clickButton('Valider le point de signalement')
    cy.fill('Nombre de cibles', 2)
    cy.fill('Nationalité', 'France')
    cy.fill('Engin', 'PTM')
    cy.fill('Titre', 'Test INN - tour du monde')
    cy.fill('Type d’infraction et NATINF 1', ['27717'])

    cy.wait('@createReporting').then(({ request }) => {
      expect(request.body.longitude).to.be.within(-10, 0)
      expect(request.body.latitude).to.be.within(45, 52)
    })
  })

  it('A reporting zone filter drawn on a wrapped world copy Should be sent with WGS84 coordinates', () => {
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.visit('/#@-545000,6135000,10.50', stubSideWindowOptions)
    cy.wait('@displayReportings')
    cy.wait(1000)
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings/display',
      query: { zone: /^MULTIPOLYGON/ }
    }).as('displayReportingsInZone')

    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // When
    cy.moveViewToWorldCopy(-1)
    cy.clickButton('Définir une zone de filtre manuelle')
    cy.get('body').click(490, 580)
    cy.get('body').click(420, 635)
    cy.get('body').dblclick(560, 620)
    cy.clickButton('Valider la zone de filtre')

    // Then
    cy.wait('@displayReportingsInZone').then(({ request }) => {
      const zone = new URL(request.url).searchParams.get('zone')!
      const longitudes = getLongitudesFromWkt(zone)

      expect(longitudes.length).to.be.greaterThan(3)
      longitudes.forEach(longitude => expect(longitude).to.be.within(-10, 0))
    })
  })

  it('A mission overlay Should be displayed next to the clicked mission copy', () => {
    cy.intercept('GET', `/bff/v1/missions*`).as('missions')
    cy.visit('/#@-188008.06,6245230.27,8.70')
    cy.wait('@missions')
    cy.wait(3000)
    cy.moveViewToWorldCopy(1)

    // When
    cy.get('#root').click(331, 789)

    // Then
    cy.get('*[data-cy="mission-overlay"]').contains('BGC LORIENT')
    assertIsInsideViewport('*[data-cy="mission-overlay"]')
  })

  it('An interest point drawn on a wrapped world copy Should have WGS84 coordinates', () => {
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)
    cy.moveViewToWorldCopy(1)

    // When
    cy.clickButton("Créer un point d'intérêt", { withoutScroll: true })
    cy.get('#root').click(490, 580, { timeout: 10000 })

    // Then
    cy.get('*[data-cy="interest-point-coordinates"]').contains('47° 4')
    cy.get('*[data-cy="interest-point-coordinates"]').contains('007° 5')
    cy.get('*[data-cy="interest-point-coordinates"]').contains('W')
    assertIsInsideViewport('*[data-cy="interest-point-coordinates"]')
  })
})
