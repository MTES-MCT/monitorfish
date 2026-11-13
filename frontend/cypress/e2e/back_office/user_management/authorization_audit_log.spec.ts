context('BackOffice > Authorization audit log', () => {
  it('Should trace the authorization changes with their author, and filter them', () => {
    cy.intercept('GET', '/bff/v1/admin/authorization_audit_logs?*').as('getAuthorizationAuditLogs')

    cy.login('superuser')
    cy.request('POST', '/bff/v1/admin/authorized_organizational_units', { organizationalUnit: 'DAM/DIRM SA' })
    cy.request('DELETE', '/bff/v1/admin/authorized_organizational_units?organizationalUnit=DAM/DIRM SA')

    cy.visit('/backoffice/users')
    cy.clickButton('Ajouter un utilisateur')
    cy.fill('E-mail', 'audited.agent@email.gouv.fr')
    cy.clickButton('Ajouter')
    cy.get('.Table-SimpleTable').contains('audited.agent@email.gouv.fr')

    cy.get('nav[aria-label="Menu du backoffice"]').contains('Journal des habilitations').click()
    cy.wait('@getAuthorizationAuditLogs')

    cy.get('nav[aria-label="Menu du backoffice"] a[aria-current="page"]').contains('Journal des habilitations')
    cy.get('.Table-SimpleTable tr')
      .contains('tr', 'audited.agent@email.gouv.fr')
      .should('contain', 'Ajout d’un utilisateur')
      .and('contain', 'dummy@email.gouv.fr')

    cy.fill('Rechercher un auteur, une cible, un e-mail...', 'DAM/DIRM SA')
    cy.wait('@getAuthorizationAuditLogs').then(({ request }) => {
      expect(request.url).to.contain('searchQuery=DAM%2FDIRM%20SA')
      expect(request.url).to.contain('pageNumber=0')
    })
    cy.get('[data-cy="authorization-audit-logs-results"]').contains('2 modifications')
    cy.get('.Table-SimpleTable tr')
      .contains('tr', 'Ajout d’un service autorisé')
      .should('contain', 'dummy@email.gouv.fr')
      .and('contain', 'DAM/DIRM SA')

    cy.fill('Filtrer par action', 'Suppression d’un service autorisé')
    cy.wait('@getAuthorizationAuditLogs').then(({ request }) => {
      expect(request.url).to.contain('action=DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT')
    })
    cy.get('[data-cy="authorization-audit-logs-results"]').contains('1 modification')
    cy.get('.Table-SimpleTable').should('not.contain', 'Ajout d’un service autorisé')

    // Reset
    cy.request('GET', '/bff/v1/admin/users').then(({ body }) => {
      const addedUser = body.find(user => user.email === 'audited.agent@email.gouv.fr')
      cy.request('DELETE', `/bff/v1/admin/users/${addedUser.hashedEmail}`)
    })
  })
})
