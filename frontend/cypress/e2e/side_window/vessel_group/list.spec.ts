context('Side Window > Vessel Group List', () => {

  it('Should display vessels groups, open and edit them', () => {
    cy.cleanDownloadedFiles()
    cy.login('superuser')

    cy.visit('/side_window')
    cy.wait(250)
    cy.getDataCy('side-window-menu-vessel-list').click()
    cy.get('[title="Groupes de navires"]').click()

    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 0)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 3)

    /**
     * Pin a vessel group
     */
    cy.get('[title=\'Epingler le groupe "Mission Thémis – chaluts de fonds"\']').click()
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 1)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Open a vessel group
     */
    cy.get('[title="Mission Thémis – chaluts de fonds"]').click()
    cy.get('[title="Mission Thémis – chaluts de fonds"]')
      .contains('Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.')
    cy.get('[title="Mission Thémis – chaluts de fonds"]')
      .contains('Points d\'attention : Si le navire X est dans le secteur, le contrôler pour suspicion ' +
        'blanchiment bar en 7.d.')

    /**
     * Delete a vessel group
     */
    cy.get('[title=\'Supprimer le groupe "Mission Thémis – chaluts de fonds"\']').click()
    cy.clickButton('Confirmer la suppression')
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 0)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Display vessels from fixed vessel groups and delete a vessel
     */
    cy.get('[title="Mission Thémis – semaine 04"]').click()
    cy.get('[title="Mission Thémis – semaine 04"]').within(() => {
      cy.get('.Table-SimpleTable tr').should('have.length', 7)
    })
    cy.get('[title="MALOTRU"]').click()
    cy.wait(200)
    // Then close the row
    cy.get('[title="MALOTRU"]').click()
    cy.get('[title=\'Supprimer le navire "MALOTRU" du groupe\']').scrollIntoView().click()
    cy.get('[title="Mission Thémis – semaine 04"]').within(() => {
      cy.get('.Table-SimpleTable tr').should('have.length', 6)
    })

    /**
     * Search a vessel in the vessel groups
     */
    cy.fill('Rechercher un navire', 'SOCR')
    // Only the found groups are displayed
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 0)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 1)

    cy.fill('Rechercher un navire', '')
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 0)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Modify a group
     */
    cy.get('[title="Mission Thémis – semaine 04"]').click()

    cy.get('[title=\'Modifier le groupe "Mission Thémis – semaine 04"\']').click()
    cy.get('.Component-Dialog').contains('Modifier un groupe de navires fixe')
    cy.get('.Component-Dialog').contains('5 navires sélectionnés.')

    cy.fill('Description du groupe', 'Nouvelle valeur.')
    cy.clickButton('Modifier le groupe')

    cy.get('[title="Mission Thémis – semaine 04"]')
      .contains('Nouvelle valeur.')
  })
})
