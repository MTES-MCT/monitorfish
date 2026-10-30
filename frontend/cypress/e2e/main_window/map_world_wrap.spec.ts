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

/** Same as visiting `/#@x,y,zoom` (see `MapHistory`), on the world copy `worldOffset` worlds away. */
function setMapView(x: number, y: number, zoom: number, worldOffset: number) {
  cy.window().then(win => {
    // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
    const { monitorfishMap } = win.olTestUtils
    monitorfishMap.getView().setCenter([x + worldOffset * WORLD_WIDTH_IN_METERS, y])
    monitorfishMap.getView().setZoom(zoom)
    monitorfishMap.renderSync()
  })
  cy.wait(500)
}

function assertViewIsOnWorldCopy(offset: number) {
  cy.getViewCenter().should(center => {
    const worldIndex = Math.round(center![0]! / WORLD_WIDTH_IN_METERS)

    expect(worldIndex).to.equal(offset)
  })
}

// The map pointer move handler is throttled: a single event is ignored, the next one within 50ms is handled
function hoverMapAt(clientX: number, clientY: number) {
  cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX, clientY, force: true, pointerId: 1 })
  cy.wait(20)
  cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: clientX + 1, clientY, force: true, pointerId: 1 })
  cy.wait(20)
  cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX, clientY, force: true, pointerId: 1 })
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

// Same retry as `hoverReportingCopy()`: a single hover sometimes lands before the WebGL hit-detection buffer is ready
function hoverTrackPointCopy(attempt = 0): Cypress.Chainable {
  cy.window().then(win => {
    // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
    const { getFeaturesFromLayer, getPixelFromCoordinate, monitorfishMap } = win.olTestUtils
    // A position in the middle of the track, away from the last position where the vessel icon is drawn on top
    const trackPositions = getFeaturesFromLayer('VESSEL_TRACK').filter(feature =>
      String(feature.getId()).includes(':position:')
    )
    const trackPoint = trackPositions[Math.floor(trackPositions.length / 2)]
    expect(trackPoint, 'a track position').to.not.equal(undefined)

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
    hoverMapAt(Math.round(pixel[0] + mapRect.left), Math.round(pixel[1] + mapRect.top))
  })
  cy.wait(300)

  return cy.get('body').then($body => {
    if ($body.find('[data-cy="vessel-track-card-longitude"]:visible').length > 0) {
      return cy.wrap($body)
    }
    if (attempt >= 10) {
      throw new Error(`Track point card was not displayed after ${attempt} hovers`)
    }

    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 5, clientY: 5, force: true, pointerId: 1 })
    cy.wait(300)

    return hoverTrackPointCopy(attempt + 1)
  })
}

/**
 * All scenarios run inside a single `it()` to avoid paying the login/visit/wait setup cost multiple times.
 * Instead of visiting another `/#@x,y,zoom` URL, each scenario sets the map view with `setMapView()`.
 * The scenarios are order-dependent: e.g. the vessel is unselected before clicking a mission at a fixed pixel.
 */
context('Map world wrap', () => {
  it('Map features Should be displayed, selected and saved on wrapped world copies', () => {
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.intercept('POST', '/bff/v1/reportings').as('createReporting')
    cy.intercept('GET', `/bff/v1/missions*`).as('missions')
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70', stubSideWindowOptions)
    cy.wait('@missions')
    cy.wait(6000)

    cy.log('The map Should be panned across the antimeridian')
    // When centering east of the antimeridian, near Wallis-et-Futuna (185° E = 175° W)
    setMapView((185 / 180) * HALF_WORLD_WIDTH_IN_METERS, -1500000, 8.7, 0)

    // Then the view is not clamped to the [-180°, 180°] extent
    cy.getViewCenter().should(center => {
      expect(center![0]).to.be.greaterThan(HALF_WORLD_WIDTH_IN_METERS)
    })

    // When hovering the map center
    cy.get('.VESSELS_POINTS').then($map => {
      const { height, left, top, width } = $map[0]!.getBoundingClientRect()
      hoverMapAt(left + width / 2, top + height / 2)
    })

    // Then the cursor coordinates are within [-180°, 180°] (175° W, not 185° E)
    cy.contains('(DMS)')
      .invoke('text')
      .should('match', /17[45]° \d{2}′ \d{2}″ W/)

    cy.log('The vessel map menu Should be displayed next to the right-clicked vessel copy')
    setMapView(-824534.42, 6082993.21, 8.7, 1)

    // When right-clicking the same vessel as in vessel_track.spec.ts, on the next world copy
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })

    // Then
    assertIsInsideViewport('*[data-cy="add-vessel-to-favorites"]')

    cy.log('An interest point drawn on a wrapped world copy Should have WGS84 coordinates')
    // When (the click on the button also closes the vessel map menu)
    cy.clickButton("Créer un point d'intérêt", { withoutScroll: true })
    cy.get('body').should($body => {
      expect($body.find('*[data-cy="add-vessel-to-favorites"]:visible')).to.have.length(0)
    })
    cy.get('#root').click(490, 580, { timeout: 10000 })

    // Then
    cy.get('*[data-cy="interest-point-coordinates"]').contains('47° 4')
    cy.get('*[data-cy="interest-point-coordinates"]').contains('007° 5')
    cy.get('*[data-cy="interest-point-coordinates"]').contains('W')
    assertIsInsideViewport('*[data-cy="interest-point-coordinates"]')
    cy.get('*[data-cy="interest-point-name-input"]').type('Tour du monde')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })

    cy.log('A vessel and its alert Should be displayed and selected on a wrapped world copy')
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
    cy.getFeaturesFromLayer('VESSEL_TRACK').should(features => {
      expect(features.filter(feature => String(feature.getId()).includes(':position:')).length).to.be.greaterThan(0)
    })
    hoverTrackPointCopy()

    // Then the track point card is displayed next to the hovered copy
    assertIsInsideViewport('*[data-cy="vessel-track-card-longitude"]')
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()
    cy.get('*[data-cy="vessel-sidebar"]').should('not.exist')

    cy.log('The view Should jump back to the main world when 2 world copies away, to keep features clickable')
    // When
    setMapView(-824534.42, 6082993.21, 8.7, -2)

    // Then
    assertViewIsOnWorldCopy(0)
    cy.hoverOrClickVesselByName('EN RÉPÉTER PÈRE', 'VESSELS_POINTS', 'click', 0, 0)
    cy.get('*[data-cy="vessel-sidebar"]').should('be.visible')
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()
    cy.get('*[data-cy="vessel-sidebar"]').should('not.exist')

    // When
    setMapView(-188008.06, 6245230.27, 8.7, -2)

    // Then
    assertViewIsOnWorldCopy(0)
    cy.get('#root').click(331, 789)
    cy.get('*[data-cy="mission-overlay"]').contains('BGC LORIENT')
    assertIsInsideViewport('*[data-cy="mission-overlay"]')

    cy.log('A mission overlay Should be displayed next to the clicked mission copy')
    setMapView(-188008.06, 6245230.27, 8.7, 1)

    // When
    cy.get('#root').click(331, 789)

    // Then
    cy.get('*[data-cy="mission-overlay"]').contains('BGC LORIENT')
    assertIsInsideViewport('*[data-cy="mission-overlay"]')

    cy.log('An alert reporting overlay Should be displayed next to the hovered reporting copy')
    setMapView(-545000, 6135000, 10.5, 1)
    cy.clickButton('Signalements')
    cy.clickButton('Afficher les signalements')
    cy.wait('@displayReportings')
    cy.wait(1000)

    // When
    hoverReportingCopy('RENCONTRER VEILLER APPARTEMENT')

    // Then
    assertIsInsideViewport('[data-cy="reporting-overlay"]')

    cy.log('A reporting point drawn on a wrapped world copy Should be saved with WGS84 coordinates')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')
    cy.clickButton('Créer un nouveau signalement INN')
    cy.get('input[name="reportingSource"][value="OTHER"]').click()
    cy.fill('Autres types de source', 'DIRM')
    cy.fill('Identité de l’émetteur', 'Jean Bon (0612365896)')

    // When the point is drawn on the next world copy
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
    cy.clickButton('Fermer')
    cy.get('*[data-cy="map-reporting-form"]').should('not.exist')

    cy.log('A reporting zone filter drawn on a wrapped world copy Should be sent with WGS84 coordinates')
    cy.intercept({
      method: 'GET',
      pathname: '/bff/v1/reportings/display',
      query: { zone: /^MULTIPOLYGON/ }
    }).as('displayReportingsInZone')
    setMapView(-545000, 6135000, 10.5, -1)
    cy.get('body').then($body => {
      if ($body.find('*[data-cy="reporting-map-menu-box"]:visible').length === 0) {
        cy.clickButton('Signalements')
      }
    })
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // When
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
})
