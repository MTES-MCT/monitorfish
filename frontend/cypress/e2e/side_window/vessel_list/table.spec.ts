context('Side Window > Vessel List > Table', () => {

  it('Should filter vessels and open a row When logged as super user', () => {
    cy.login('superuser')

    cy.visit('/side_window')
    cy.wait(250)
    cy.getDataCy('side-window-menu-vessel-list').click()

    /**
     * /!\ We need to apply a first filter to display the vessels in the table.
     * This is to ensure the filter to be backward compatible
     */

    cy.fill('Nationalités', ['Espagne', 'France'])
    cy.getDataCy('vessel-list-length').contains('1002 navires équipés VMS')
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

    cy.fill('Date du dernier contrôle', 'Contrôlé il y a plus de 3 mois')
    cy.getDataCy('vessel-list-length').contains('1 navire équipé VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.get('.Component-SingleTag').should('have.length', 9)

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

  it('Should filter vessels and open a row When logged as user', () => {
    cy.login('user')

    cy.visit('/side_window')
    cy.wait(250)
    cy.getDataCy('side-window-menu-vessel-list').click()

    /**
     * /!\ We need to apply a first filter to display the vessels in the table.
     * This is to ensure the filter to be backward compatible
     */

    cy.fill('Nationalités', ['Espagne', 'France'])
    cy.getDataCy('vessel-list-length').contains('1002 navires équipés VMS')
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

    cy.fill('Date du dernier contrôle', 'Contrôlé il y a plus de 3 mois')
    cy.getDataCy('vessel-list-length').contains('1 navire équipé VMS')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)

    cy.get('.Component-SingleTag').should('have.length', 9)

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
