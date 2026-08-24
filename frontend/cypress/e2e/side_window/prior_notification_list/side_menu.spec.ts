import { openSideWindowPriorNotificationListAsSuperUser } from './utils'

const BADGE_NUMBER_SELECTOR = '[data-cy="side-window-sub-menu-ALL-number"] > div'

context('Side Window > Prior Notification List > Side Menu', () => {
  beforeEach(() => {
    openSideWindowPriorNotificationListAsSuperUser()
  })

  it('Should update the badge number When a prior notification is verified', () => {
    // Given
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()

    // Specs sharing this shard's database may have created prior notifications left to verify,
    // so the badge is compared to its own initial value rather than to the seeded one.
    cy.get(BADGE_NUMBER_SELECTOR)
      .invoke('text')
      .then(initialBadgeNumber => {
        const expectedBadgeNumber = Number(initialBadgeNumber) - 1

        cy.fill('Rechercher un navire', 'FILET DOUX')

        cy.getTableRowById('00000000-0000-4000-0000-000000000007').clickButton('Éditer le préavis')
        if (document.querySelector('[data-cy="first-loader"]')) {
          cy.getDataCy('first-loader').should('not.be.visible')
        }

        // When
        cy.clickButton('Diffuser')

        // Then
        cy.get(BADGE_NUMBER_SELECTOR).should('have.text', String(expectedBadgeNumber))
      })
  })
})
