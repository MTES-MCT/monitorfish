import { createReportingFromVesselSidebar } from '../../main_window/vessel_sidebar/utils'

context('Side Window > Reporting List > Actions', () => {
  beforeEach(() => {
    cy.login('superuser')
  })

  it('Reportings Should be archived', () => {
    createReportingFromVesselSidebar('COURANT MAIN PROFESSEUR').then(createdReportingId => {
      cy.intercept('PUT', '/bff/v1/reportings/archive').as('archiveReportings')

      // Given
      cy.visit('/side_window')
      cy.getDataCy('side-window-reporting-tab').click()
      cy.getDataCy('side-window-sub-menu-NAMO').click()
      cy.fill('Observations', false)

      cy.getDataCy('ReportingTable-reporting').then($reportingRows => {
        const numberOfReportings = $reportingRows.length

        // When
        cy.get('table .rs-checkbox-wrapper').eq(1).click({ force: true })
        cy.getDataCy('archive-reporting-cards').click({ force: true })
        cy.clickButton('Archiver')

        cy.wait('@archiveReportings').then(archiveInterception => {
          if (!archiveInterception.request) {
            assert.fail('`createInterception.response` is undefined.')
          }

          // Then
          assert.deepEqual(archiveInterception.request.body, [createdReportingId])

          cy.getDataCy('ReportingTable-reporting').should('have.length', numberOfReportings - 1)
        })
      })
    })
  })

  it('Reportings Should be deleted', () => {
    cy.intercept('DELETE', '/bff/v1/reportings').as('deleteReportings')

    createReportingFromVesselSidebar('COURANT MAIN PROFESSEUR').then(createdReportingId => {
      // Given
      cy.visit('/side_window')
      cy.getDataCy('side-window-reporting-tab').click()
      cy.getDataCy('side-window-sub-menu-NAMO').click()
      cy.fill('Observations', false)

      cy.getDataCy('ReportingTable-reporting').then($reportingRows => {
        const numberOfReportings = $reportingRows.length

        // When
        cy.get('table .rs-checkbox-wrapper').eq(1).click({ force: true })
        cy.getDataCy('delete-reporting-cards').click({ force: true })
        cy.clickButton('Supprimer')

        cy.wait('@deleteReportings').then(archiveInterception => {
          if (!archiveInterception.request) {
            assert.fail('`createInterception.response` is undefined.')
          }

          // Then
          assert.deepEqual(archiveInterception.request.body, [createdReportingId])

          cy.getDataCy('ReportingTable-reporting').should('have.length', numberOfReportings - 1)
        })
      })
    })
  })

  it('A Reporting Should be edited', () => {
    cy.intercept('PUT', 'bff/v1/reportings/7').as('updateReporting')

    // Given
    cy.login('superuser')
    cy.visit('/side_window')
    cy.wait(500)
    cy.getDataCy('side-window-reporting-tab').click()
    cy.getDataCy('side-window-sub-menu-NAMO').click()

    // When
    cy.clickButton('Editer le signalement', {
      withinSelector: 'tr:contains("COURANT MAIN PROFESSEUR")'
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

    cy.getDataCy('ReportingTable-reporting').should('have.length.greaterThan', 1)
    cy.get('tr:contains("COURANT MAIN PROFESSEUR")').contains('DML 56')
    cy.get('tr:contains("COURANT MAIN PROFESSEUR")').contains(23581)

    /**
     * The reporting type must be modified to OBSERVATION
     */

    cy.getDataCy('ReportingTable-reporting').then($reportingRows => {
      const numberOfReportings = $reportingRows.length

      cy.clickButton('Editer le signalement', {
        withinSelector: 'tr:contains("COURANT MAIN PROFESSEUR")'
      })

      // When
      cy.fill('Type de signalement', 'Observation')
      cy.fill('Saisi par', '{backspace}{backspace}{backspace}LTH')
      cy.clickButton('Valider')

      // Then
      cy.wait('@updateReporting').then(({ request, response }) => {
        expect(request.body.type).contains('OBSERVATION')
        expect(request.body.authorTrigram).contains('LTH')
        expect(response && response.statusCode).equal(200)

        cy.getDataCy('ReportingTable-reporting').should('have.length', numberOfReportings)
      })
    })
  })

  it('A reporting Should be downloaded', () => {
    cy.cleanDownloadedFiles()

    // Given
    cy.login('superuser')
    cy.visit('/side_window')
    cy.wait(500)
    cy.getDataCy('side-window-reporting-tab').click()

    // There should be one reporting either in SA or NAME sea front, depending on the previous
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
        '"Alerte auto.","Pêche dans les 12 milles sans droits historiques","",2610,"FR","PROMETTRE INTÉRIEUR SAINT","ABC000232227","ZJ472279","TMG5756","NON","SA"'
      )
    })
  })

  function downloadReporting(seafront, csvValues) {
    cy.getDataCy(`side-window-sub-menu-${seafront}`).click()
    cy.fill('Observations', false)
    cy.get('table .rs-checkbox-wrapper').eq(0).click({ force: true })

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
