export function hoverOrClickVesselByName(
  vesselName: string,
  layerName: string = 'VESSELS_POINTS',
  action: 'hover' | 'click' = 'hover',
  topNegativeOffset: number = 0
): Cypress.Chainable {
  return cy.get(`.${layerName}`).then($mapElement =>
    cy.window().then(win => {
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const features = win.olTestUtils.getFeaturesFromLayer(layerName)

      const vessel = features.find((feature: any) => feature.get('vesselName') === vesselName)
      if (!vessel) {
        throw new Error(`Vessel "${vesselName}" not found in ${layerName} layer`)
      }

      const coordinates = vessel.getGeometry().getCoordinates()

      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const [mapWidth, mapHeight] = win.olTestUtils.getMapSize() ?? [1280, 1024]
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      let pixel = win.olTestUtils.getPixelFromCoordinate(coordinates)
      const isVisible = pixel && pixel[0] >= 0 && pixel[0] <= mapWidth && pixel[1] >= 0 && pixel[1] <= mapHeight
      if (!isVisible) {
        // Vessel is off-screen (e.g. map panned after a previous click).
        // Center the map instantly so we can compute a valid click position.
        // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
        win.olTestUtils.monitorfishMap.getView().setCenter(coordinates)
        // Force a synchronous re-render so the WebGL hit-detection buffer
        // reflects the new viewport before the click events are triggered.
        // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
        win.olTestUtils.monitorfishMap.renderSync()
        // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
        pixel = win.olTestUtils.getPixelFromCoordinate(coordinates)
      }

      const mapElement = $mapElement[0]
      if (!mapElement) {
        throw new Error('Map element not found')
      }
      const mapRect = mapElement.getBoundingClientRect()

      const clientX = Math.round(pixel[0] + mapRect.left)
      const clientY = Math.round(pixel[1] + mapRect.top - topNegativeOffset)

      if (action === 'click') {
        // OL emulates its own 'click' from pointerdown/pointerup — it never reads
        // the native DOM click event. Two requirements for emulateClick_() to fire:
        //   • Trigger on map.getViewport(): the exact element OL's listener is on.
        //   • button: 0 must be explicit: Cypress defaults pointerup to button:-1
        //     (PointerEvents "no state change" sentinel), which fails OL's
        //     isMouseActionButton_() check and silently skips click emulation.
        cy.window().then(clickWin => {
          // @ts-ignore
          const viewport = clickWin.olTestUtils.monitorfishMap.getViewport()
          cy.wrap(viewport).trigger('pointerdown', { button: 0, clientX, clientY, force: true, pointerId: 1 })
          cy.wait(20)
          cy.wrap(viewport).trigger('pointerup', { button: 0, clientX, clientY, force: true, pointerId: 1 })
        })
      } else {
        // Trigger pointermove events at the vessel's pixel location.
        // Multiple events help ensure the hover is detected.
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX,
          clientY,
          force: true,
          pointerId: 1
        })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX: clientX + 1,
          clientY,
          force: true,
          pointerId: 1
        })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX,
          clientY: clientY + 1,
          force: true,
          pointerId: 1
        })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX,
          clientY: clientY - 1,
          force: true,
          pointerId: 1
        })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX: clientX + 1,
          clientY: clientY + 1,
          force: true,
          pointerId: 1
        })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX: clientX - 1,
          clientY: clientY - 1,
          force: true,
          pointerId: 1
        })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointermove', {
          clientX,
          clientY,
          force: true,
          pointerId: 1
        })
      }
    })
  )
}
