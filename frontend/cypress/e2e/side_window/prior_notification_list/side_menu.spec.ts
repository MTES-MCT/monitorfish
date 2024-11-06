import { openSideWindowPriorNotificationListAsSuperUser } from './utils'

context('Side Window > Prior Notification List > Side Menu', () => {
  beforeEach(() => {
    openSideWindowPriorNotificationListAsSuperUser()
  })

  it('Should update the badge number When a prior notification is verified', () => {
    // Given
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
    cy.get('[data-cy="side-window-sub-menu-ALL-number"] > div').contains('2')
    cy.fill('Rechercher un navire', 'FILET DOUX')

    cy.getTableRowById('00000000-0000-4000-0000-000000000007').clickButton('Éditer le préavis')
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    // When
    cy.clickButton('Diffuser')

    // Then
    cy.get('[data-cy="side-window-sub-menu-ALL-number"] > div').contains('1')
  })
})
