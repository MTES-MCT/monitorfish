context('Side Window > Vessel List > Table', () => {

  it('Should filter vessels, open a row and download the CSV When logged as super user', () => {
    cy.cleanDownloadedFiles()
    cy.login('superuser')

    cy.visit('/side_window')
    cy.wait(250)
    cy.getDataCy('side-window-menu-vessel-list').click()

    cy.fill('Nationalités', ['Espagne', 'France'])
    cy.getDataCy('vessel-list-length').contains('841 navires équipés VMS')
    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 2)

    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])
    cy.getDataCy('vessel-list-length').contains('4 navires équipés VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 5)

    cy.fill('Espèces à bord', ['FRF', 'HKE'])
    cy.getDataCy('vessel-list-length').contains('4 navires équipés VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 5)

    cy.fill('Engins utilisés', ['OTT', 'TBS'])
    cy.getDataCy('vessel-list-length').contains('1 navire équipé VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.fill('Dernier contrôle', 'Contrôlé il y a plus de 3 mois')
    cy.getDataCy('vessel-list-length').contains('1 navire équipé VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.get('.Component-SingleTag').should('have.length', 10)

    /**
     * Open a row
     */
    cy.get('[title="PARENT EXPLIQUER COUCHER"]').click()
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('NWW01 – NWW01')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('NWW03 – NWW03')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('OTT – Chaluts jumeaux à panneaux')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('OTB – Chaluts de fond à panneaux')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('ANF – 4164.47 kg')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('LEZ – 330.72 kg')

    /**
     * Download the CSV
     */
    cy.get('[title="Télécharger la liste des navires"]').should('have.attr', 'disabled')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648"] > td > div > div > label').click({ force: true })
    cy.get('[title="Télécharger la liste des navires"]').should('not.have.attr', 'disabled')
    cy.clickButton('Télécharger la liste des navires')
    cy.clickButton('Télécharger le tableau')

    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout

      return cy
        .readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should('contains', 'Nationalité,Nom,CFR,C/S,MMSI,Longueur,GDH (UTC),Latitude,Longitude,Cap,Vitesse')
        .should('contains', '"France","PARENT EXPLIQUER COUCHER","ABC000452438","CC0029","211049483","30.1 m"')
        .should('contains', '"47°43.740′N","003°21.600′W",0,0')
    })
  })

  it('Should filter vessels and open a row When not logged as user', () => {
    cy.login('user')

    cy.visit('/side_window')
    cy.wait(250)
    cy.getDataCy('side-window-menu-vessel-list').click()

    cy.fill('Nationalités', ['Espagne', 'France'])
    cy.getDataCy('vessel-list-length').contains('841 navires équipés VMS')
    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 2)

    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])
    cy.getDataCy('vessel-list-length').contains('4 navires équipés VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 5)

    cy.fill('Espèces à bord', ['FRF', 'HKE'])
    cy.getDataCy('vessel-list-length').contains('4 navires équipés VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 5)

    cy.fill('Engins utilisés', ['OTT', 'TBS'])
    cy.getDataCy('vessel-list-length').contains('1 navire équipé VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.fill('Dernier contrôle', 'Contrôlé il y a plus de 3 mois')
    cy.getDataCy('vessel-list-length').contains('1 navire équipé VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.get('.Component-SingleTag').should('have.length', 10)

    /**
     * Open a row
     */
    cy.get('[title="PARENT EXPLIQUER COUCHER"]').click()
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('NWW01 – NWW01')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('NWW03 – NWW03')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('OTT – Chaluts jumeaux à panneaux')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('OTB – Chaluts de fond à panneaux')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('ANF – 4164.47 kg')
    cy.get('[data-id="VESSELS_POINTS:ABC000452438/CC0029/OO600648-expanded"]').contains('LEZ – 330.72 kg')
  })
})
