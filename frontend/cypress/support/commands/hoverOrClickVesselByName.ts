export function hoverOrClickVesselByName(
  vesselName: string,
  layerName: string = 'VESSELS_POINTS',
  action: 'hover' | 'click' = 'hover',
  topNegativeOffset: number = 0,
): Cypress.Chainable {
  return cy.get(`.${layerName}`).then($mapElement =>
    cy.window().then(win => {
      // Get all vessel features from the layer
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const features = win.olTestUtils.getFeaturesFromLayer(layerName)

      // Find the first feature with a matching name that is visible in the current map viewport
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const [mapWidth, mapHeight] = win.olTestUtils.getMapSize() ?? [1280, 1024]

      const vessel = features.find((feature: any) => {
        if (feature.get('vesselName') !== vesselName) {
          return false
        }
        const coords = feature.getGeometry().getCoordinates()
        // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
        const px = win.olTestUtils.getPixelFromCoordinate(coords)
        if (!px) {
          return false
        }

        return px[0] >= 0 && px[0] <= mapWidth && px[1] >= 0 && px[1] <= mapHeight
      })

      if (!vessel) {
        throw new Error(`Vessel with name "${vesselName}" not found (visible) in ${layerName} layer`)
      }

      // Get the vessel's coordinates
      const coordinates = vessel.getGeometry().getCoordinates()
      cy.log(`Found ${vesselName} at coordinates: [${coordinates[0]}, ${coordinates[1]}]`)

      // Convert coordinates to pixel position (relative to map viewport)
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const pixel = win.olTestUtils.getPixelFromCoordinate(coordinates)
      cy.log(`Pixel position (map-relative): [${pixel[0]}, ${pixel[1]}]`)

      // Get the map element's offset in the window
      const mapElement = $mapElement[0]
      if (!mapElement) {
        throw new Error('Map element not found')
      }
      const mapRect = mapElement.getBoundingClientRect()
      cy.log(`Map offset: [${mapRect.left}, ${mapRect.top}]`)

      // Calculate absolute position in the window
      const clientX = Math.round(pixel[0] + mapRect.left)
      const clientY = Math.round(pixel[1] + mapRect.top - topNegativeOffset)
      cy.log(`Client position (window-relative): [${clientX}, ${clientY}]`)

      if (action === 'click') {
        cy.get(`.${layerName}`).trigger('pointerdown', { clientX, clientY, force: true, pointerId: 1 })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('pointerup', { clientX, clientY, force: true, pointerId: 1 })
        cy.wait(20)
        cy.get(`.${layerName}`).trigger('click', { clientX, clientY, force: true, pointerId: 1 })
      } else {
        // Trigger pointermove events at the vessel's pixel location
        // Multiple events help ensure the hover is detected
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
