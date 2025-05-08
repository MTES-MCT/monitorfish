context('Vessel groups', () => {
  it('A dynamic vessel group Should be created and displayed on the map', () => {
    cy.login('superuser')
    cy.visit('/side_window')
    cy.wait(250)

    /**
     * Add filters
     */
    cy.getDataCy('side-window-menu-vessel-list').click()
    cy.fill('Nationalités', ['Espagne', 'France'])
    cy.getDataCy('vessel-list-length').contains('841 navires')
    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 2)

    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])
    cy.getDataCy('vessel-list-length').contains('4 navires')
    cy.get('.Table-SimpleTable tr').should('have.length', 5)

    cy.clickButton('Créer un groupe de navires')
    cy.clickButton('Créer un groupe dynamique')

    /**
     * Create the vessel group
     */
    cy.get('.Component-Dialog').contains('Actuellement, 4 navires correspondent aux filtres sélectionnés.')
    cy.get('.Component-Dialog').within(() => {
      cy.get('.Component-SingleTag').should('have.length', 5)
    })

    cy.fill('Engins utilisés', ['OTT'], { index: 1 })
    cy.get('.Component-Dialog').contains('Actuellement, 1 navire correspond aux filtres sélectionnés.')
    cy.get('.Component-Dialog').within(() => {
      cy.get('.Component-SingleTag').eq(4).within(() => {
        cy.get('button').click()
      })
    })
    cy.wait(200)
    cy.get('.Component-Dialog').contains('Actuellement, 4 navires correspondent aux filtres sélectionnés.')

    cy.get('[title="#8c2c17"]').click()
    cy.fill("Nom du groupe", "Lorem ipsum dolor sit amet")
    cy.fill("Description du groupe", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer egestas pulvinar lacus quis fringilla.")
    cy.fill("Points d'attention", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
    cy.clickButton('Créer le groupe')
    cy.contains('Le groupe de navires dynamique "Lorem ipsum dolor sit amet" a bien été créé.').should('be.visible')

    /**
     * Open the main window and display the created vessel group
     */
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)

    cy.clickButton('Groupes de navires')
    cy.get('[title="Lorem ipsum dolor sit amet"]').click()
    cy.get('[title="Lorem ipsum dolor sit amet"]').contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer egestas pulvinar lacus quis fringilla.')
    cy.get('[title="Lorem ipsum dolor sit amet"]').contains('Groupe dynamique')
    cy.get('[title="Afficher les critères de définition du groupe"]').click()
    cy.get('[title="Lorem ipsum dolor sit amet"]').within(() => {
      cy.get('.Component-SingleTag').should('have.length', 5)
    })
    cy.get('[title="Masquer les critères de définition du groupe"]').click()

    /**
     * Modify the created group
     */
    cy.get('[title=\'Modifier le groupe "Lorem ipsum dolor sit amet"\']').click()
    cy.get('.Component-Dialog').contains('Modifier un groupe de navires dynamique')
    cy.get('.Component-Dialog').contains('Actuellement, 4 navires correspondent aux filtres sélectionnés.')
    // Name of the vessel group
    cy.get('[id="name"]').should('have.value', 'Lorem ipsum dolor sit amet')
    cy.get('[id="description"]').should('have.value', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer egestas pulvinar lacus quis fringilla.')

    cy.fill('Description du groupe', 'Modification de la description: consectetur adipiscing elit.')
    // Deletion of the last filter
    cy.get('.Component-Dialog').within(() => {
      cy.get('.Component-SingleTag').eq(3).within(() => {
        cy.get('button').click()
      })
    })

    // Add a custom zone
    cy.fill('Filtrer les navires avec une zone', ['Zone manuelle'])
    cy.get('body').click(490, 580)
    cy.get('body').click(420, 635)
    cy.get('body').dblclick(560, 620)
    cy.clickButton('Valider la zone de groupe')
    cy.get('.Component-Dialog').within(() => {
      cy.get('.Component-SingleTag').eq(4).contains('Zone de filtre manuelle')
    })
    cy.clickButton('Modifier le groupe')
    cy.contains('Le groupe de navires dynamique "Lorem ipsum dolor sit amet" a bien été modifié.').should('be.visible')

    /**
     * Verify the modified values
     */
    cy.get('[title="Lorem ipsum dolor sit amet"]').click()
    cy.get('[title="Lorem ipsum dolor sit amet"]')
      .contains('Modification de la description: consectetur adipiscing elit.')
    cy.get('[title="Afficher les critères de définition du groupe"]').click()
    cy.get('[title="Lorem ipsum dolor sit amet"]').within(() => {
      cy.get('.Component-SingleTag').should('have.length', 5)
      cy.get('.Component-SingleTag').eq(4).contains('Zone de filtre manuelle')
    })
    cy.get('[title="Masquer les critères de définition du groupe"]').click()

    /**
     * Pin and unpin vessel groups to change order
     */
    cy.getDataCy('vessel-groups-list').within(() => {
      cy.get('li').should('have.length', 4)
      cy.get('li').eq(0).contains('Lorem ipsum dolor sit amet')
      cy.get('li').eq(1).contains('Mission Thémis – semaine 04')
      cy.get('li').eq(2).contains('Mission Thémis – semaine 03')
      cy.get('li').eq(3).contains('Mission Thémis – chaluts de fonds')

      cy.get("[title=\'Epingler le groupe \"Mission Thémis – chaluts de fonds\"\']").click()
      cy.get('li').eq(0).contains('Mission Thémis – chaluts de fonds')
      cy.get('li').eq(1).contains('Lorem ipsum dolor sit amet')
      cy.get('li').eq(2).contains('Mission Thémis – semaine 04')
      cy.get('li').eq(3).contains('Mission Thémis – semaine 03')

      cy.get("[title=\'Epingler le groupe \"Mission Thémis – semaine 03\"\']").click()
      cy.get('li').eq(0).contains('Mission Thémis – semaine 03')
      cy.get('li').eq(1).contains('Mission Thémis – chaluts de fonds')
      cy.get('li').eq(2).contains('Lorem ipsum dolor sit amet')
      cy.get('li').eq(3).contains('Mission Thémis – semaine 04')

      cy.get("[title=\'Dépingler le groupe \"Mission Thémis – chaluts de fonds\"\']").click()
      cy.get("[title=\'Dépingler le groupe \"Mission Thémis – semaine 03\"\']").click()
      cy.get('li').eq(0).contains('Lorem ipsum dolor sit amet')
      cy.get('li').eq(1).contains('Mission Thémis – semaine 04')
      cy.get('li').eq(2).contains('Mission Thémis – semaine 03')
      cy.get('li').eq(3).contains('Mission Thémis – chaluts de fonds')
    })

    /**
     * Delete the created group
     */
    cy.get("[title=\'Supprimer le groupe \"Lorem ipsum dolor sit amet\"\']").click()
    cy.clickButton('Confirmer la suppression')

    cy.contains('Le groupe de navires a bien été supprimé.').should('be.visible')

    /**
     * Create a group from the main window
     */
    cy.clickButton('Créer un nouveau groupe')
    cy.clickButton('Créer un groupe dynamique')

    cy.get('.Component-Dialog').contains('Actuellement, 842 navires correspondent aux filtres sélectionnés.')
    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])
    cy.get('.Component-Dialog').contains('Actuellement, 4 navires correspondent aux filtres sélectionnés.')

    cy.get('[title="#8c2c17"]').click()
    cy.fill("Nom du groupe", "Lorem ipsum dynamique")
    cy.fill("Description du groupe", "Lorem ipsum dolor sit amet.")
    cy.clickButton('Créer le groupe')
    cy.contains('Le groupe de navires dynamique "Lorem ipsum dynamique" a bien été créé.').should('be.visible')

    cy.clickButton('Groupes de navires')
    cy.get('[title="Lorem ipsum dynamique"]').click()

    cy.get("[title=\'Supprimer le groupe \"Lorem ipsum dynamique\"\']").click()
    cy.clickButton('Confirmer la suppression')
  })

  it('A fixed vessel group Should be created and displayed on the map', () => {
    cy.login('superuser')
    cy.visit('/side_window')
    cy.wait(250)

    /**
     * Select vessels
     */
    cy.getDataCy('side-window-menu-vessel-list').click()
    cy.get('.Component-SingleTag').within(() => {
      cy.get('button').click()
    })

    cy.fill('Rechercher un navire', '103914')
    cy.get('[data-id="VESSELS_POINTS:ABC000103914/UNKNOWN/TQ736775"]').within(() => {
      cy.get('[type="checkbox"]').click({ force: true })
    })
    cy.getDataCy('vessel-list-reset-filters').click()

    cy.fill('Rechercher un navire', '179704')
    cy.get('[data-id="VESSELS_POINTS:ABC000179704/VZ9304/SD490259"]').within(() => {
      cy.get('[type="checkbox"]').click({ force: true })
    })
    cy.getDataCy('vessel-list-reset-filters').click()

    cy.fill('Rechercher un navire', '926735')
    cy.get('[data-id="VESSELS_POINTS:ABC000926735/RZTU/RB921922"]').within(() => {
      cy.get('[type="checkbox"]').click({ force: true })
    })
    cy.getDataCy('vessel-list-reset-filters').click()

    cy.clickButton('Créer un groupe de navires')
    cy.clickButton('Créer un groupe fixe')

    /**
     * Create the vessel group
     */
    cy.get('.Component-Dialog').contains('3 navires sélectionnés.')

    cy.get('input[type=file]').selectFile('cypress/fixtures/groupes_fixes.csv', {
      action: 'drag-drop',
      force: true
    })

    cy.get('.Component-Dialog').contains('4 navires sélectionnés.')

    cy.get('[title="#8c2c17"]').click()
    cy.fill("Nom du groupe", "Dolor sit amet")
    cy.fill("Description du groupe", "Consectetur adipiscing elit. Integer egestas pulvinar lacus quis fringilla.")
    cy.clickButton('Créer le groupe')
    cy.contains('Le groupe de navires fixe "Dolor sit amet" a bien été créé.').should('be.visible')

    /**
     * Open the main window and display the created vessel group
     */
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)

    cy.clickButton('Groupes de navires')
    cy.get('[title="Dolor sit amet"]').click()
    cy.get('[title="Dolor sit amet"]').contains('Consectetur adipiscing elit. Integer egestas pulvinar lacus quis fringilla.')
    cy.get('[title="Dolor sit amet"]').contains('Groupe fixe')

    /**
     * Modify the created group
     */
    cy.get('[title=\'Modifier le groupe "Dolor sit amet"\']').click()
    cy.get('.Component-Dialog').contains('Modifier un groupe de navires fixe')
    cy.get('.Component-Dialog').contains('4 navires sélectionnés.')
    // Name of the vessel group
    cy.get('[id="name"]').should('have.value', 'Dolor sit amet')
    cy.get('[id="description"]').should('have.value', 'Consectetur adipiscing elit. Integer egestas pulvinar lacus quis fringilla.')

    cy.fill('Description du groupe', 'Modification de la description: consectetur adipiscing elit.')
    cy.clickButton('Modifier le groupe')
    cy.contains('Le groupe de navires fixe "Dolor sit amet" a bien été modifié.').should('be.visible')

    /**
     * Verify the modified values
     */
    cy.get('[title="Dolor sit amet"]').click()
    cy.get('[title="Dolor sit amet"]')
      .contains('Modification de la description: consectetur adipiscing elit.')

    /**
     * Delete the created group
     */
    cy.get("[title=\'Supprimer le groupe \"Dolor sit amet\"\']").click()
    cy.clickButton('Confirmer la suppression')

    cy.contains('Le groupe de navires a bien été supprimé.').should('be.visible')
    cy.wait(250)

    /**
     * Create a fixed group from the main window
     */
    cy.clickButton('Créer un nouveau groupe')
    cy.clickButton('Créer un groupe fixe')

    cy.get('.Component-Dialog').contains('0 navire sélectionné.')

    cy.get('input[type=file]').selectFile('cypress/fixtures/groupes_fixes.csv', {
      action: 'drag-drop',
      force: true
    })

    cy.get('.Component-Dialog').contains('1 navire sélectionné.')

    cy.get('[title="#8c2c17"]').click()
    cy.fill("Nom du groupe", "Lorem ipsum")
    cy.fill("Description du groupe", "Lorem ipsum dolor sit amet.")
    cy.clickButton('Créer le groupe')
    cy.wait(250)

    cy.get('[title="Lorem ipsum"]').click()
    cy.get("[title=\'Supprimer le groupe \"Lorem ipsum\"\']").click()
    cy.clickButton('Confirmer la suppression')
  })
})
