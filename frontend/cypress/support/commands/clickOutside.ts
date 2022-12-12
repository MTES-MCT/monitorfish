/**
 * @description
 * Useful to close modals.
 */
export function clickOutside(yPosition: number = 0) {
  cy.get('body').click(0, yPosition)
}
