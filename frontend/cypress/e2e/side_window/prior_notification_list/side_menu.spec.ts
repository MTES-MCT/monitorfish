import { SideWindowMenuLabel } from '../../../../src/domain/entities/sideWindow/constants'

context('Side Window > Prior Notification List > Side Menu', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.visit('/side_window')
    cy.wait(500)

    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    cy.clickButton(SideWindowMenuLabel.PRIOR_NOTIFICATION_LIST)
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }
    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should update the badge number When a prior notification is verified', () => {
    // Given
    cy.get('[data-cy="side-window-sub-menu-ALL"]').click()
    cy.get('[data-cy="side-window-sub-menu-ALL-number"] > div').contains('2')
    cy.fill('Rechercher un navire', 'FILET DOUX')

    cy.getTableRowById('00000000-0000-4000-0000-000000000007' as any).clickButton('Éditer le préavis')
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    // When
    cy.clickButton('Diffuser')

    // Then
    cy.get('[data-cy="side-window-sub-menu-ALL-number"] > div').contains('1')
  })
})
