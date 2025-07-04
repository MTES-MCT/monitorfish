context('Side Window > Vessel Group List', () => {
  it('Should display vessels groups, open and edit them', () => {
    cy.cleanDownloadedFiles()
    cy.login('superuser')

    cy.visit('/side_window')
    cy.wait(250)
    cy.getDataCy('side-window-menu-vessel-list').click()
    cy.get('[title="Groupes de navires"]').click()

    cy.getDataCy('pinned-vessels-groups').should('not.exist')
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Filter by expired
     */

    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)
    cy.get('[title="Groupes expirés"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 3)

    /**
     * Filter by group type
     */
    cy.get('[title="Groupes fixes"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)
    cy.get('[title="Groupes fixes"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 3)

    cy.get('[title="Groupes dynamiques"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 1)
    cy.get('[title="Groupes dynamiques"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 3)

    /**
     * Filter by sharing
     */
    cy.get('[title="Groupes personnels"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 1)
    cy.get('[title="Groupes personnels"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 3)

    cy.get('[title="Groupes partagés"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)
    cy.get('[title="Groupes partagés"]').click()
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 3)

    /**
     * Pin a vessel group
     */
    cy.get('[title=\'Epingler le groupe "Mission Thémis – chaluts de fonds"\']').click()
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 1)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Open a dynamic vessel group and display vessels
     */
    cy.get('[title="Mission Thémis – chaluts de fonds"]').contains('86 navires')
    cy.get('[title="Mission Thémis – chaluts de fonds"]').click()
    cy.get('[title="Mission Thémis – chaluts de fonds"]').contains(
      'Ciblage pour la mission du Thémis (bordée A) du 08/01 au 17/01/25.'
    )
    cy.get('[title="Mission Thémis – chaluts de fonds"]').contains(
      "Points d'attention : Si le navire X est dans le secteur, le contrôler pour suspicion " +
        'blanchiment bar en 7.d.'
    )
    cy.get('[title="Mission Thémis – chaluts de fonds"]').within(() => {
      cy.get('.Table-SimpleTable tr').should('have.length', 87)
    })

    /**
     * Delete a vessel group
     */
    cy.get('[title=\'Supprimer le groupe "Mission Thémis – chaluts de fonds"\']').click({ force: true })
    cy.clickButton('Annuler')
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 1)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Display vessels from fixed vessel groups and delete a vessel
     */
    cy.get('[title="Mission Thémis – semaine 04"]').contains('6 navires')
    cy.get('[title="Mission Thémis – semaine 04"]').click()
    cy.get('[title="Mission Thémis – semaine 04"]').within(() => {
      cy.get('.Table-SimpleTable tr').should('have.length', 7)
      cy.get('[title="MALOTRU"]').scrollIntoView().click({ force: true })
      cy.wait(200)
      // Then close the row
      cy.get('[title="MALOTRU"]').click({ force: true })
      cy.get('[title=\'Supprimer le navire "MALOTRU" du groupe\']').scrollIntoView().click()
      cy.get('.Table-SimpleTable tr').should('have.length', 6)
    })

    /**
     * Add a vessel to a fixed vessel group
     */
    cy.get('input[placeholder="Rechercher un navire pour l\'ajouter au groupe"]').scrollIntoView().type('POINT')
    cy.contains('mark', 'POINT').click()
    cy.wait(200)
    cy.get('[title="Mission Thémis – semaine 04"]').within(() => {
      cy.get('.Table-SimpleTable tr').should('have.length', 7)
    })

    /**
     * Search a vessel in the vessel groups
     */
    cy.fill('Rechercher un navire', 'SOCRA')
    // Only the found groups are displayed
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 1)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 1)
    cy.get('[title="Mission Thémis – semaine 04"]').within(() => {
      cy.get('.Table-SimpleTable tr').should('have.length', 2)
      cy.get('.Table-SimpleTable tr').eq(1).contains('SOCRATE')
    })

    cy.fill('Rechercher un navire', 'SOCRAERRORRRR')
    cy.getDataCy('pinned-vessels-groups').should('not.exist')
    cy.getDataCy('unpinned-vessels-groups').should('not.exist')

    cy.fill('Rechercher un navire', '')
    cy.getDataCy('pinned-vessels-groups').children().should('have.length', 1)
    cy.getDataCy('unpinned-vessels-groups').children().should('have.length', 2)

    /**
     * Modify a group
     */
    cy.get('[title="Mission Thémis – semaine 04"]').click()

    cy.get('[title=\'Modifier le groupe "Mission Thémis – semaine 04"\']').click({ force: true })
    cy.get('.Component-Dialog').contains('Modifier un groupe de navires fixe')
    cy.get('.Component-Dialog').contains('6 navires sélectionnés.')

    cy.fill('Description du groupe', 'Nouvelle valeur.')
    cy.clickButton('Modifier le groupe')

    cy.get('[title="Mission Thémis – semaine 04"]').contains('Nouvelle valeur.')

    /**
     * Download a group
     */
    cy.get('[title=\'Télécharger le groupe "Mission Thémis – semaine 04"\']').click({ force: true })

    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout

      return cy
        .readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should(
          'contains',
          '"Royaume-Uni","PHENOMENE","FAK000999999","CALLME","","DONTSINK","14.3 m","W10, PEL03","OTB","BLI, HKE"'
        )
    })
  })
})
