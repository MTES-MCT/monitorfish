context('Side Window > Reporting List > Actions', () => {
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
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy('ReportingList-reporting').should('have.length', 1)

    // When
    // Select and archive a reporting
    cy.get('.rs-checkbox-wrapper').first().click()
    cy.getDataCy('archive-reporting-cards').click({ force: true })
    cy.wait('@archiveReportings').then(({ request }) => {
      expect(request.body.toString()).contains('5')
    })

    // Then
    // Should delete the row
    cy.getDataCy('ReportingList-reporting').should('have.length', 0)
  })

  it('Reportings Should be searched and ordered by date', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete', {
      body: {
        id: 1
      },
      statusCode: 200
    }).as('deleteReportings')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy('side-window-sub-menu-NAMO').click()
    cy.wait(200)

    cy.getDataCy('ReportingList-reporting').first().children().children().next().next().invoke('text').as('firstRow')
    cy.getDataCy('ReportingList-reporting').last().children().children().next().next().invoke('text').as('lastRow')
    cy.getDataCy('table-order-by-validationDate').click()
    cy.getDataCy('table-order-by-validationDate').click()

    cy.get<string>('@firstRow').then(firstRow => {
      // When we re-order by date
      cy.getDataCy('table-order-by-validationDate').click()

      // Then it is re-ordered
      cy.getDataCy('ReportingList-reporting').last().contains(firstRow)
    })

    // We reset the order
    cy.getDataCy('table-order-by-validationDate').click()

    cy.get<string>('@lastRow').then(lastRow => {
      // When we re-order by date
      cy.getDataCy('table-order-by-validationDate').click()

      // Then it is re-ordered
      cy.getDataCy('ReportingList-reporting').first().contains(lastRow)
    })

    // When we search by vessel name
    cy.getDataCy('side-window-reporting-search').type('RENCONTRER')

    // Then there is only the searched vessel
    cy.getDataCy('ReportingList-reporting').first().contains('RENCONTRER VEILLER APPARTEMENT"')
    cy.getDataCy('ReportingList-reporting').should('have.length', 1)
  })

  it('Reportings Should be deleted', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete', {
      body: {
        id: 1
      },
      statusCode: 200
    }).as('deleteReportings')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy('side-window-sub-menu-NAMO').click()

    cy.getDataCy('ReportingList-reporting').then($reportingRows => {
      const numberOfReportings = $reportingRows.length

      // When
      // Select reporting
      cy.get('.rs-checkbox-wrapper').eq(1).click()
      // Select reporting
      cy.get('.rs-checkbox-wrapper').last().click()
      // Delete two reportings
      cy.getDataCy('delete-reporting-cards').click({ force: true })
      cy.wait('@deleteReportings').then(({ request, response }) => {
        expect(request.body).to.have.length(2)
        expect(response && response.statusCode).equal(200)
      })

      // Then
      // Should delete the row
      cy.getDataCy('ReportingList-reporting').should('have.length', numberOfReportings - 2)
    })
  })

  it('A Reporting Should be edited', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy('side-window-sub-menu-NAMO').click()

    // When
    cy.clickButton('Editer le signalement', {
      withinSelector: '[data-cy="ReportingList-reporting"][data-id="6"]'
    })
    cy.fill('Titre', 'Suspicion de chalutage dans les 3 km')
    cy.fill('Natinf', 'maille')
    cy.clickButton('Valider')

    // Then
    cy.wait('@updateReporting').then(({ request, response }) => {
      expect(request.body.natinfCode).equal(23581)
      expect(request.body.title).contains('Suspicion de chalutage dans les 3 km')
      expect(response && response.statusCode).equal(200)
    })
    cy.wait(200)

    cy.getDataCy('ReportingList-reporting').should('have.length.greaterThan', 1)
    cy.get('[data-cy="ReportingList-reporting"][data-id="6"]').contains('DML 56')
    cy.get('[data-cy="ReportingList-reporting"][data-id="6"]').contains(23581)
  })

  it('A Reporting Should be edited with the reporting type modified ', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy('side-window-sub-menu-NAMO').click()

    cy.getDataCy('ReportingList-reporting').then($reportingRows => {
      const numberOfReportings = $reportingRows.length

      cy.clickButton('Editer le signalement', {
        withinSelector: '[data-cy="ReportingList-reporting"][data-id="6"]'
      })

      // When
      cy.fill('Type', 'Observation')
      cy.fill('Saisi par', '{backspace}{backspace}{backspace}LTH')
      cy.clickButton('Valider')

      // Then
      cy.wait('@updateReporting').then(({ request, response }) => {
        expect(request.body.type).contains('OBSERVATION')
        expect(request.body.authorTrigram).contains('LTH')
        expect(response && response.statusCode).equal(200)

        cy.getDataCy('ReportingList-reporting').should('have.length', numberOfReportings - 1)
      })
    })
  })

  it('A reporting Should be downloaded', () => {
    // Given
    cy.cleanFiles()
    cy.getDataCy('side-window-reporting-tab').click()

    // There should be one reporting either in SA or NAME sea front, depending of the previous
    // Cypress test file runned by the CI
    cy.getDataCy('side-window-sub-menu-NAMO').then($number => {
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

  function downloadReporting(seafront, csvValues) {
    cy.getDataCy(`side-window-sub-menu-${seafront}`).click()
    cy.get('.rs-checkbox-checker').eq(0).click({ timeout: 10000 })

    // When
    cy.clickButton('Télécharger 1 signalement')

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
