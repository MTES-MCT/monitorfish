export const WORLD_WIDTH_IN_METERS = 40075016.68557849

/**
 * Moves the map view by `offset` whole worlds: the map looks the same, but every
 * click and hover lands on a wrapped world copy (e.g. after the user panned around the globe).
 */
export function moveViewToWorldCopy(offset: number = 1): Cypress.Chainable {
  return cy.window().then(win => {
    // @ts-ignore - olTestUtils is added to window in monitorfishMap.ts for testing
    const { monitorfishMap } = win.olTestUtils
    const view = monitorfishMap.getView()
    const [x, y] = view.getCenter()

    view.setCenter([x + offset * WORLD_WIDTH_IN_METERS, y])
    monitorfishMap.renderSync()
  })
}
