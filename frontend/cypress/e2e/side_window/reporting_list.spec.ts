context('Reportings', () => {
  beforeEach(() => {
    cy.visit('/side_window')
  })

  it('Reportings Should be archived', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/archive', {
      body: {
        id: 1
      },
      statusCode: 200
    }).as('archiveReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)

    // When
    // Select and archive a reporting
    cy.get('.rs-checkbox-wrapper').first().click()
    cy.get('*[data-cy="archive-reporting-cards"]').click({ force: true })
    cy.wait('@archiveReportings').then(({ request }) => {
      expect(request.body.toString()).contains('5')
    })

    // Then
    // Should delete the row
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 0)
  })

  it('Reportings Should be searched and ordered by date', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete', {
      body: {
        id: 1
      },
      statusCode: 200
    }).as('deleteReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)

    cy.get('*[data-cy="side-window-current-reportings"]')
      .first()
      .children()
      .children()
      .next()
      .next()
      .invoke('text')
      .as('firstRow')
    cy.get('*[data-cy="side-window-current-reportings"]')
      .last()
      .children()
      .children()
      .next()
      .next()
      .invoke('text')
      .as('lastRow')
    cy.get('[data-cy="table-order-by-validationDate"]').click()
    cy.get('[data-cy="table-order-by-validationDate"]').click()

    cy.get<string>('@firstRow').then(firstRow => {
      // When we re-order by date
      cy.get('[data-cy="table-order-by-validationDate"]').click()

      // Then it is re-ordered
      cy.get('*[data-cy="side-window-current-reportings"]').last().contains(firstRow)
    })

    // We reset the order
    cy.get('[data-cy="table-order-by-validationDate"]').click()

    cy.get<string>('@lastRow').then(lastRow => {
      // When we re-order by date
      cy.get('[data-cy="table-order-by-validationDate"]').click()

      // Then it is re-ordered
      cy.get('*[data-cy="side-window-current-reportings"]').first().contains(lastRow)
    })

    // When we search by vessel name
    cy.get('*[data-cy^="side-window-reporting-search"]').type('RENCONTRER')

    // Then there is only the searched vessel
    cy.get('*[data-cy="side-window-current-reportings"]').first().contains('RENCONTRER VEILLER APPARTEMENT"')
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)
  })

  it('Reportings Should be deleted', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete', {
      body: {
        id: 1
      },
      statusCode: 200
    }).as('deleteReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)

    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 3)

    // When
    // Select reporting
    cy.get('.rs-checkbox-wrapper').eq(1).click()
    // Select reporting
    cy.get('.rs-checkbox-wrapper').last().click()
    // Delete two reportings
    cy.get('*[data-cy="delete-reporting-cards"]').click({ force: true })
    cy.wait('@deleteReportings').then(({ request, response }) => {
      expect(request.body).to.have.length(2)
      expect(response && response.statusCode).equal(200)
    })

    // Then
    // Should delete the row
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)
  })

  it('A Reporting Should be edited', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()

    // When
    cy.get('[data-cy="side-window-edit-reporting"]').eq(1).click()
    cy.get('[data-cy="new-reporting-title"]').type(
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace} km'
    )
    cy.get('[data-cy="new-reporting-select-natinf"]').click()
    cy.wait(200)
    cy.get('.rs-picker-search-bar-input').type('maille{enter}')
    cy.wait(200)
    cy.get('[data-cy="new-reporting-create-button"]').click()

    // Then
    cy.wait('@updateReporting').then(({ request, response }) => {
      expect(request.body.natinfCode).equal(23581)
      expect(request.body.title).contains('Suspicion de chalutage dans les 3  km')
      expect(response && response.statusCode).equal(200)
    })
    cy.wait(200)

    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 3)
    // We do not know if the edited reporting is the first or second row in the list
    cy.get('*[data-cy="side-window-current-reportings"]')
      .eq(1)
      .then($firstRow => {
        // The DML is modified as this is the DML fetched from the vessels table
        if ($firstRow.text().includes('DML 56')) {
          cy.get('*[data-cy="side-window-current-reportings"]').first().contains(23581)

          return
        }

        cy.get('*[data-cy="side-window-current-reportings"]').eq(2).contains('DML 56')
        cy.get('*[data-cy="side-window-current-reportings"]').eq(2).contains(23581)
      })
  })

  it('A Reporting Should be edited with the reporting type modified ', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()

    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 3)

    // When
    // We do not know if the edited reporting is the first or second row in the list
    cy.get('[data-cy="side-window-current-reportings"]')
      .eq(1)
      .then($firstRow => {
        // The DML is modified as this is the DML fetched from the vessels table
        if ($firstRow.text().includes('DML 56')) {
          modifyReportingToObservation(1, 3)
        } else {
          modifyReportingToObservation(2, 3)
        }
      })
  })

  function modifyReportingToObservation(rowNumber, numberOfReportings) {
    cy.get('[data-cy="side-window-edit-reporting"]').eq(rowNumber).click()
    cy.get('[data-cy="new-reporting-select-observation-reporting-type"]').click()
    cy.get('[data-cy="new-reporting-author-trigram"]').type('{backspace}{backspace}{backspace}LTH')
    cy.wait(500)
    cy.get('[data-cy="new-reporting-create-button"]').click()

    // Then
    cy.wait('@updateReporting').then(({ request, response }) => {
      expect(request.body.type).contains('OBSERVATION')
      expect(request.body.authorTrigram).contains('LTH')
      expect(response && response.statusCode).equal(200)
    })
    cy.wait(50)

    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings - 1)
  }

  it('A reporting Should be downloaded', () => {
    // Given
    cy.cleanFiles()
    cy.get('*[data-cy="side-window-reporting-tab"]').click()

    // There should be one reporting either in SA or NAME sea front, depending of the previous
    // Cypress test file runned by the CI
    cy.get('*[data-cy^="side-window-sub-menu-NAMO"]').then($number => {
      if ($number.text().includes('1')) {
        downloadReporting(
          'NAMO',
          '"DML 29","Cross Etel","Pêche sans VMS ni JPE","Pêche thon rouge sans VMS détecté ni JPE",27689,"FR","RENCONTRER VEILLER APPARTEMENT""","ABC000597493","JL026591","CMQ7994","NON","NAMO"'
        )

        return
      }

      downloadReporting(
        'SA',
        '"Alerte auto.","12 milles - Pêche sans droits historiques","",2610,"FR","PROMETTRE INTÉRIEUR SAINT","ABC000232227","ZJ472279","TMG5756","NON","SA"'
      )
    })
  })

  function downloadReporting(seaFront, csvValues) {
    cy.get(`[data-cy="side-window-sub-menu-${seaFront}"]`).click()
    cy.get('.rs-checkbox-checker').eq(0).click({ timeout: 10000 })

    // When
    cy.get('[title="Télécharger 1 signalement"]').click()

    // Then
    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout

      return cy
        .readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should(
          'contains',
          'Ouvert le,DML concernée,Origine,Titre,Description,NATINF,Pavillon,Navire,CFR,Marquage ext.,C/S,Navire sous charte,Façade'
        )
        .should('contains', csvValues)
    })
  }
})
