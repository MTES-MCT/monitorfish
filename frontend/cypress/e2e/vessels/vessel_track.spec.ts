import { getLocalizedDayjs } from '../utils/getLocalizedDayjs'
import { getUtcizedDayjs } from '../utils/getUtcizedDayjs'

/**
 * Wait (with retries, until the timeout) for a vessels layer to be loaded AND drawn,
 * instead of sleeping for a fixed duration that may not be enough on slow machines.
 *
 * Having features in the layer source is not enough: the WebGL layer must also have rendered them
 * for clicks to hit them. So, when a vessel is inside the viewport, we wait for it to be found by hit-detection.
 */
function waitForVesselsLayer(layerName: string = 'VESSELS_POINTS') {
  cy.window({ timeout: 30000 }).should(win => {
    // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
    const { monitorfishMap } = win.olTestUtils ?? {}
    // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
    const features = win.olTestUtils?.getFeaturesFromLayer(layerName) ?? []
    expect(features.length, `${layerName} features`).to.be.greaterThan(0)

    const [width, height] = monitorfishMap.getSize() ?? [1280, 1024]
    let pixelInViewport: number[] | undefined
    for (const feature of features) {
      const pixel = monitorfishMap.getPixelFromCoordinate(feature.getGeometry().getCoordinates())
      if (pixel && pixel[0] >= 0 && pixel[0] <= width && pixel[1] >= 0 && pixel[1] <= height) {
        pixelInViewport = pixel
        break
      }
    }

    // Some views have no vessel of this layer on screen (e.g. the AIS test): nothing to hit-detect then
    if (!pixelInViewport) {
      return
    }

    const hitFeature = monitorfishMap.forEachFeatureAtPixel(pixelInViewport, (feature: any) => feature, {
      hitTolerance: 5,
      layerFilter: (layer: any) => layer.get('code') === layerName
    })
    expect(hitFeature, `${layerName} drawn (hit-detection ready)`).to.exist
  })
}

context('Vessels Track', () => {
  it('A track Should be showed When clicking on a vessel with CTRL key pressed', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    waitForVesselsLayer()

    // When
    cy.wait(400)
    cy.get('.VESSELS_POINTS').click(460, 480, { ctrlKey: true, force: true, timeout: 10000 })
    cy.wait(400)
    cy.get('.VESSELS_POINTS').click(504, 290, { ctrlKey: true, force: true, timeout: 10000 })
    cy.wait(400)
    cy.get('.VESSELS_POINTS').click(295, 300, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
    cy.wait(400)

    cy.log('Show only the selected vessels')
    cy.get('*[data-cy^="trigger-hide-other-vessels-from-sidebar"]').click({ timeout: 10000 })
    cy.wait(200)

    cy.get('body').type('-', { force: true }) // Because of the throttle, we de-zoom to show labels
    cy.wait(200)
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 3)
    cy.wait(200)

    cy.log('Close the sidebar')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 10000 }).should('not.exist')

    cy.log('Close one track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(1).click({ force: true })
    cy.get('body').type('+', { force: true }) // Because of the throttle, we zoom to refresh labels
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.get('body').type('-', { force: true }) // Because of the throttle, we de-zoom to refresh labels
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 1)

    cy.log('Close the last track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })

  it('AIS vessel tracks Should be shown and hidden individually When clicking on AIS vessels', () => {
    cy.login('superuser')
    cy.visit('/#@-1849025.62,4982527.30,8.81')
    waitForVesselsLayer()

    cy.intercept('GET', '/bff/v1/vessels/ais*').as('aisVessels')
    cy.clickButton('AIS')
    cy.wait('@aisVessels')
    cy.wait(1000)

    // Select BELLE ETOILE
    cy.intercept('GET', '/bff/v1/vessels/ais/positions*').as('belleEtoilePositions')
    cy.hoverOrClickVesselByName('BELLE ETOILE', 'AIS_VESSELS_POINTS', 'click')
    cy.wait('@belleEtoilePositions')
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    // Select VIENTO DEL MAR alongside BELLE ETOILE
    cy.intercept('GET', '/bff/v1/vessels/ais/positions*').as('vientoDelMarPositions')
    cy.hoverOrClickVesselByName('VIENTO DEL MAR', 'AIS_VESSELS_POINTS', 'click')
    cy.wait('@vientoDelMarPositions')
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)

    // Deselect first track
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    // Deselect last track
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })

  it('A track Should be showed When clicking on a vessel with the custom map menu', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    waitForVesselsLayer()

    // The map zooms to the first track once shown, so the second vessel's pixel position moves.
    // Keep its map coordinate now to right-click it wherever it ends up.
    cy.window().then(win => {
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const coordinate = win.olTestUtils.monitorfishMap.getCoordinateFromPixel([504, 290])
      cy.wrap(coordinate).as('secondVesselCoordinate')
    })

    cy.log('Show a first vessel with a three day track depth')
    cy.wait(200)
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-three-days"]').click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.log('Show a second vessel with a custom date range')
    // Wait for the map to stop moving, then locate the second vessel
    cy.window().should(win => {
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      expect(win.olTestUtils.monitorfishMap.getView().getAnimating()).to.equal(false)
    })
    cy.get<number[]>('@secondVesselCoordinate').then(coordinate => {
      cy.window().then(win => {
        // The map has been fitted to the first track: the second vessel may now be off-screen.
        // Center the map instantly on it and force a synchronous render so hit-detection is up to date.
        // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
        const { monitorfishMap } = win.olTestUtils
        monitorfishMap.getView().setCenter(coordinate)
        monitorfishMap.renderSync()
        const [x, y] = monitorfishMap.getPixelFromCoordinate(coordinate)
        cy.get('.VESSELS_POINTS').rightclick(Math.round(x), Math.round(y), { force: true, timeout: 10000 })
      })
    })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-custom-period"]').click({ force: true })
    cy.get('.rs-picker-daterange .rs-picker-caret-icon').eq(0).click(460, 480, { force: true, timeout: 10000 })

    const asDayjsUtcDate = getLocalizedDayjs(getUtcizedDayjs().toDate())
    const today = [asDayjsUtcDate.year(), asDayjsUtcDate.month() + 1, asDayjsUtcDate.date()]
    cy.fill('Période précise', [today, today])
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
  })
})
