context('BackOffice > Users', () => {
  it('Should manage users, administrations and authorized services', () => {
    cy.intercept('GET', '/bff/v1/admin/users').as('getUsers')
    cy.intercept('POST', '/bff/v1/admin/users').as('addUser')
    cy.intercept('PUT', '/bff/v1/admin/users/*/administrator').as('updateUserIsAdministrator')
    cy.intercept('PUT', '/bff/v1/admin/users/administrations/DOUANE').as('replaceAdministrationUsers')
    cy.intercept('GET', '/bff/v1/admin/authorized_organizational_units').as('getAuthorizedOrganizationalUnits')

    cy.login('superuser')
    cy.visit('/backoffice/users')
    cy.wait('@getUsers')

    // Menu
    cy.get('nav[aria-label="Menu du backoffice"] a[aria-current="page"]').contains('Utilisateurs')
    cy.get('nav[aria-label="Menu du backoffice"]').contains('dummy@email.gouv.fr')
    cy.get('nav[aria-label="Menu du backoffice"]').contains('Retour à la carte')
    cy.get('nav[aria-label="Menu du backoffice"]').contains('MonitorFish')

    cy.get('button[aria-label="Replier le menu"]').click()

    cy.get('nav[aria-label="Menu du backoffice"]').should('not.contain', 'Utilisateurs')
    cy.get('nav[aria-label="Menu du backoffice"] a[title="Utilisateurs"]').should('have.attr', 'aria-current', 'page')

    cy.get('button[aria-label="Déplier le menu"]').click()

    // List and filters
    cy.get('[data-cy="users-results"]').contains('2 utilisateurs')
    cy.get('.Table-SimpleTable').contains('another@email.com')
    cy.get('.Table-SimpleTable').contains('Douane')
    cy.get('.Table-SimpleTable').contains('CNSP · Pôle OPS métropole')

    cy.fill('Rechercher un e-mail', 'dummy')

    cy.get('[data-cy="users-results"]').contains('1 utilisateur')
    cy.get('.Table-SimpleTable').contains('dummy@email.gouv.fr')

    cy.fill('Rechercher un e-mail', undefined)
    cy.fill('Filtrer par type', 'Externe')

    cy.get('[data-cy="users-results"]').contains('1 utilisateur')
    cy.get('.Table-SimpleTable').contains('another@email.com')

    cy.fill('Filtrer par type', undefined)
    cy.fill('Filtrer par activité', 'Jamais connectés')

    // The super user has just logged in
    cy.get('.Table-SimpleTable').should('not.contain', 'dummy@email.gouv.fr')

    cy.fill('Filtrer par activité', undefined)

    // Current user
    cy.get('.Table-SimpleTable').contains('Dernière connexion (UTC)')
    cy.get('.Table-SimpleTable tr')
      .contains('tr', 'dummy@email.gouv.fr')
      .contains(/\d{2}\/\d{2}\/\d{4} à \d{2}h\d{2}/)
    cy.get('.Table-SimpleTable tr').contains('tr', 'dummy@email.gouv.fr').find('.rs-toggle-disabled').should('exist')
    cy.get('.Table-SimpleTable tr')
      .contains('tr', 'dummy@email.gouv.fr')
      .find('button[title="Supprimer cet utilisateur"]')
      .should('be.disabled')

    // Add a CNSP user and grant its administrator rights
    cy.clickButton('Ajouter un utilisateur')
    cy.fill('E-mail', 'another@email.com')
    cy.get('.Component-Dialog').contains('Cet utilisateur existe déjà.')

    cy.fill('E-mail', 'New.Agent@email.gouv.fr')
    cy.fill('Pôle CNSP', 'Pôle SIP')
    cy.clickButton('Ajouter')

    cy.wait('@addUser').then(({ request, response }) => {
      expect(request.body).to.deep.include({ email: 'new.agent@email.gouv.fr', isSuperUser: true, service: 'POLE_SIP' })
      expect(response?.statusCode).to.equal(201)
    })
    cy.get('.Table-SimpleTable').contains('new.agent@email.gouv.fr')

    cy.get('.Table-SimpleTable tr').contains('tr', 'new.agent@email.gouv.fr').find('.rs-toggle').click()
    cy.wait('@updateUserIsAdministrator').then(({ request }) => {
      expect(request.body).to.deep.equal({ isAdministrator: true })
    })

    // Removing all the users of an administration must be confirmed
    cy.clickButton('Importer une liste')
    cy.fill('Administration', 'Gendarmerie maritime')

    cy.get('.Component-Dialog').contains('button', 'Mettre à jour').should('be.disabled')

    cy.fill('Je confirme la suppression de tous les utilisateurs de cette administration', true)

    cy.get('.Component-Dialog').contains('button', 'Mettre à jour').should('be.enabled')

    cy.clickButton('Annuler')

    // Add an external user
    cy.clickButton('Ajouter un utilisateur')
    cy.fill('E-mail', 'gendarme@gendarmerie.interieur.gouv.fr')
    cy.fill('Type d’utilisateur', 'Externe')
    cy.fill('Administration', 'Gendarmerie maritime')
    cy.clickButton('Ajouter')

    cy.wait('@addUser').then(({ request }) => {
      expect(request.body).to.deep.include({
        administration: 'GENDARMERIE_MARITIME',
        email: 'gendarme@gendarmerie.interieur.gouv.fr',
        isSuperUser: false
      })
    })
    cy.get('.Table-SimpleTable').contains('gendarme@gendarmerie.interieur.gouv.fr')

    // Import the emails of an administration from a CSV file
    cy.clickButton('Importer une liste')
    cy.fill('Administration', 'Douane')

    cy.get('.Component-Dialog input[type=file]').selectFile('cypress/fixtures/utilisateurs_administration.csv', {
      action: 'drag-drop',
      force: true
    })

    cy.get('textarea[name="emails"]').should(
      'have.value',
      'jean.dupont@douane.finances.gouv.fr\nmarie.martin@douane.finances.gouv.fr'
    )
    cy.get('[data-cy="replace-administration-users-diff"]').contains('2 utilisateurs à ajouter')
    cy.get('[data-cy="replace-administration-users-diff"]').contains('jean.dupont@douane.finances.gouv.fr')
    cy.get('[data-cy="replace-administration-users-diff"]').contains('marie.martin@douane.finances.gouv.fr')
    cy.get('[data-cy="replace-administration-users-diff"]').contains('1 utilisateur à supprimer')

    // Replace the users of an administration
    cy.fill('E-mails (un par ligne, ou séparés par des virgules)', 'new.agent@douane.finances.gouv.fr')

    cy.get('[data-cy="replace-administration-users-diff"]').contains('1 utilisateur à ajouter')
    cy.get('[data-cy="replace-administration-users-diff"]').contains('new.agent@douane.finances.gouv.fr')
    cy.get('[data-cy="replace-administration-users-diff"]').contains('1 utilisateur à supprimer')
    cy.get('[data-cy="replace-administration-users-diff"]').contains('another@email.com')

    cy.clickButton('Mettre à jour')

    cy.wait('@replaceAdministrationUsers').then(({ request, response }) => {
      expect(request.body.emails).to.deep.equal(['new.agent@douane.finances.gouv.fr'])
      expect(response?.body.addedEmails).to.deep.equal(['new.agent@douane.finances.gouv.fr'])
      expect(response?.body.removedEmails).to.deep.equal(['another@email.com'])
    })
    cy.get('.Table-SimpleTable').contains('new.agent@douane.finances.gouv.fr')
    cy.get('.Table-SimpleTable').should('not.contain', 'another@email.com')

    // Authorized services
    cy.get('[role="tab"]').contains('Services autorisés (Cerbère)').click()
    cy.wait('@getAuthorizedOrganizationalUnits')

    cy.get('[data-cy="authorized-organizational-units"]').contains('DAM/DPMA')

    cy.fill('Service', 'DAM/DIRM MEMN')
    cy.clickButton('Ajouter')

    cy.get('[data-cy="authorized-organizational-units"]').contains('DAM/DIRM MEMN')

    cy.clickButton('Supprimer le service autorisé DAM/DIRM MEMN')

    cy.get('[data-cy="authorized-organizational-units"]').should('not.contain', 'DAM/DIRM MEMN')

    // Reset
    cy.request('PUT', '/bff/v1/admin/users/administrations/DOUANE', { emails: ['another@email.com'] })
    cy.request('PUT', '/bff/v1/admin/users/administrations/GENDARMERIE_MARITIME', {
      emails: [],
      isEmptyListConfirmed: true
    })
    cy.request('GET', '/bff/v1/admin/users').then(({ body }) => {
      const addedUser = body.find(user => user.email === 'new.agent@email.gouv.fr')
      cy.request('DELETE', `/bff/v1/admin/users/${addedUser.hashedEmail}`)
    })
  })
})
