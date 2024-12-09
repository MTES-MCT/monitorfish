import { openSideWindowPriorNotificationListAsSuperUser } from './utils'

context('Side Window > Prior Notification List > Actions', () => {
  beforeEach(() => {
    openSideWindowPriorNotificationListAsSuperUser()
  })

  it('Should open a prior notification vessel reporting list', () => {
    cy.fill('Rechercher un navire', 'DOS FIN')

    cy.getTableRowById('00000000-0000-4000-0000-000000000002').click()
    cy.get('[role="link"][title="Ouvrir la liste des signalements pour ce navire"]').click()

    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }

    cy.getDataCy('SideWindowCard-body').contains('DOS FIN').should('be.visible')
    cy.getDataCy('SideWindowCard-body')
      .contains('button', 'Voir tout l’historique des signalements dans la fiche navire')
      .should('be.visible')
  })
})
