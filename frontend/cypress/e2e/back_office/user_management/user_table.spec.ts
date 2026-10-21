context('BackOffice > Users', () => {
  beforeEach(() => {
    cy.intercept('GET', '/bff/v1/admin/users').as('getUsers')
    cy.intercept('GET', '/bff/v1/admin/authorized_organizational_units').as('getAuthorizedOrganizationalUnits')

    cy.login('superuser')

    cy.visit('/backoffice/users')
    cy.wait(['@getUsers', '@getAuthorizedOrganizationalUnits'])
  })

  it('Should list users and filter them', () => {
    cy.get('[data-cy="users-results"]').contains('2 utilisateurs')
    cy.get('.Table-SimpleTable').contains('another@email.com')
    cy.get('.Table-SimpleTable').contains('Douane')

    cy.fill('Rechercher un e-mail', 'dummy')

    cy.get('[data-cy="users-results"]').contains('1 utilisateur')
    cy.get('.Table-SimpleTable').contains('dummy@email.gouv.fr')
  })

  it('Should add a CNSP user and an external user', () => {
    cy.intercept('POST', '/bff/v1/admin/users').as('addUser')

    cy.clickButton('Ajouter un utilisateur')
    cy.fill('E-mail', 'another@email.com')
    cy.get('.Component-Dialog').contains('Cet utilisateur existe déjà.')

    cy.fill('E-mail', 'New.Agent@email.gouv.fr')
    cy.fill('Service CNSP', 'Pôle SIP')
    cy.clickButton('Ajouter')

    cy.wait('@addUser').then(({ request, response }) => {
      expect(request.body).to.deep.include({ email: 'new.agent@email.gouv.fr', isSuperUser: true, service: 'POLE_SIP' })
      expect(response?.statusCode).to.equal(201)
    })
    cy.get('.Table-SimpleTable').contains('new.agent@email.gouv.fr')

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

    // Reset
    cy.request('PUT', '/bff/v1/admin/users/administrations/GENDARMERIE_MARITIME', { emails: [] })
    cy.request('GET', '/bff/v1/admin/users').then(({ body }) => {
      const addedUser = body.find(user => user.email === 'new.agent@email.gouv.fr')
      cy.request('DELETE', `/bff/v1/admin/users/${addedUser.hashedEmail}`)
    })
  })

  it('Should replace the users of an administration', () => {
    cy.intercept('PUT', '/bff/v1/admin/users/administrations/DOUANE').as('replaceAdministrationUsers')

    cy.clickButton('Mettre à jour les utilisateurs d’une administration')
    cy.fill('Administration', 'Douane')
    cy.fill('E-mails (un par ligne, ou séparés par des virgules)', 'new.agent@douane.finances.gouv.fr')

    cy.get('[data-cy="replace-administration-users-diff"]').contains(
      '1 utilisateur à ajouter : new.agent@douane.finances.gouv.fr'
    )
    cy.get('[data-cy="replace-administration-users-diff"]').contains('1 utilisateur à supprimer : another@email.com')

    cy.clickButton('Mettre à jour')

    cy.wait('@replaceAdministrationUsers').then(({ request, response }) => {
      expect(request.body.emails).to.deep.equal(['new.agent@douane.finances.gouv.fr'])
      expect(response?.body.addedEmails).to.deep.equal(['new.agent@douane.finances.gouv.fr'])
      expect(response?.body.removedEmails).to.deep.equal(['another@email.com'])
    })
    cy.get('.Table-SimpleTable').contains('new.agent@douane.finances.gouv.fr')
    cy.get('.Table-SimpleTable').should('not.contain', 'another@email.com')

    // Reset
    cy.request('PUT', '/bff/v1/admin/users/administrations/DOUANE', { emails: ['another@email.com'] })
  })

  it('Should import the emails of an administration from a CSV file', () => {
    cy.clickButton('Mettre à jour les utilisateurs d’une administration')
    cy.fill('Administration', 'Douane')

    cy.get('.Component-Dialog input[type=file]').selectFile('cypress/fixtures/utilisateurs_administration.csv', {
      action: 'drag-drop',
      force: true
    })

    cy.get('textarea[name="emails"]').should(
      'have.value',
      'jean.dupont@douane.finances.gouv.fr\nmarie.martin@douane.finances.gouv.fr'
    )
    cy.get('[data-cy="replace-administration-users-diff"]').contains(
      '2 utilisateurs à ajouter : jean.dupont@douane.finances.gouv.fr, marie.martin@douane.finances.gouv.fr'
    )
    cy.get('[data-cy="replace-administration-users-diff"]').contains('1 utilisateur à supprimer : another@email.com')

    cy.clickButton('Annuler')
  })

  it('Should display the last login date and update the administrator rights', () => {
    cy.intercept('PUT', '/bff/v1/admin/users/*/administrator').as('updateUserIsAdministrator')

    cy.get('.Table-SimpleTable').contains('Dernière connexion (UTC)')
    // The super user has just logged in
    cy.get('.Table-SimpleTable tr')
      .contains('tr', 'dummy@email.gouv.fr')
      .contains(/\d{2}\/\d{2}\/\d{4} à \d{2}h\d{2}/)
    // An administrator can't remove its own administrator rights
    cy.get('.Table-SimpleTable tr').contains('tr', 'dummy@email.gouv.fr').find('.rs-toggle-disabled').should('exist')

    cy.clickButton('Ajouter un utilisateur')
    cy.fill('E-mail', 'future.admin@email.gouv.fr')
    cy.clickButton('Ajouter')
    cy.get('.Table-SimpleTable').contains('future.admin@email.gouv.fr')

    cy.get('.Table-SimpleTable tr').contains('tr', 'future.admin@email.gouv.fr').find('.rs-toggle').click()
    cy.wait('@updateUserIsAdministrator').then(({ request }) => {
      expect(request.body).to.deep.equal({ isAdministrator: true })
    })

    // Reset
    cy.request('GET', '/bff/v1/admin/users').then(({ body }) => {
      const addedUser = body.find(user => user.email === 'future.admin@email.gouv.fr')
      cy.request('DELETE', `/bff/v1/admin/users/${addedUser.hashedEmail}`)
    })
  })

  it('Should add and delete an authorized organizational unit', () => {
    cy.get('[role="tab"]').contains('Unités organisationnelles autorisées (Cerbère)').click()

    cy.get('[data-cy="authorized-organizational-units"]').contains('DAM/DPMA')

    cy.fill('Unité organisationnelle', 'DAM/DIRM MEMN')
    cy.clickButton('Ajouter')

    cy.get('[data-cy="authorized-organizational-units"]').contains('DAM/DIRM MEMN')

    cy.clickButton('Supprimer l’unité organisationnelle DAM/DIRM MEMN')

    cy.get('[data-cy="authorized-organizational-units"]').should('not.contain', 'DAM/DIRM MEMN')
  })
})
