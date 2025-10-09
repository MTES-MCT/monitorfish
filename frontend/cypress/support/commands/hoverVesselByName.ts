export function hoverVesselByName(vesselName: string): Cypress.Chainable {
  return cy.get('.VESSELS_POINTS').then($mapElement =>
    cy.window().then(win => {
      // Get all vessel features from the VESSELS_POINTS layer
      // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
      const features = win.olTestUtils.getFeaturesFromLayer('VESSELS_POINTS')

      // Find the vessel by name
      const vessel = features.find((f: any) => f.get('vesselName') === vesselName)

      if (!vessel) {
        throw new Error(`Vessel with name "${vesselName}" not found in VESSELS_POINTS layer`)
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
      const clientY = Math.round(pixel[1] + mapRect.top)
      cy.log(`Client position (window-relative): [${clientX}, ${clientY}]`)

      // Trigger pointermove events at the vessel's pixel location
      // Multiple events help ensure the hover is detected
      cy.get('.VESSELS_POINTS').trigger('pointermove', {
        clientX,
        clientY,
        force: true,
        pointerId: 1
      })
      cy.wait(20)
      cy.get('.VESSELS_POINTS').trigger('pointermove', {
        clientX: clientX + 1,
        clientY,
        force: true,
        pointerId: 1
      })
      cy.wait(20)
      cy.get('.VESSELS_POINTS').trigger('pointermove', {
        clientX,
        clientY: clientY + 1,
        force: true,
        pointerId: 1
      })
      cy.wait(20)
      cy.get('.VESSELS_POINTS').trigger('pointermove', {
        clientX,
        clientY,
        force: true,
        pointerId: 1
      })
    })
  )
}
