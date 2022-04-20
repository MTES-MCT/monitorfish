/* eslint-disable no-undef */
/// <reference types="cypress" />
import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Update Regulation', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice/regulation`)
    cy.clearLocalStorage()

    // Open a regulation to edit
    cy.get('[data-cy="law-type"]').should('have.length', 3)
    cy.get('[data-cy="law-type"]').eq(1).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click({ force: true })
    cy.get('[data-cy="regulatory-layer-zone"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-zone"]').eq(0).trigger('mouseover', { force: true })
    cy.get('[data-cy="regulatory-layer-zone-edit"]')
      .should('have.length', 1)
      .click({ force: true })
    cy.url().should('include', '/regulation/edit')
  })

  it('A layer zone Should be edited', () => {
    // When check expected form values
    cy.get('[data-cy^="tag"]').should('have.length', 9)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-Ouest Cotentin Bivalves"]').should('exist')
    cy.get('[data-cy="tag-Normandie"]').should('exist')
    cy.get('[data-cy="tag-Bretagne"]').should('exist')
    cy.get('[data-cy="tag-598"]').should('exist')
    cy.get('[data-cy="tag-texte de reference"]').should('exist')
    cy.get('[data-cy="tag-OURSINS NCA (URC)"]').should('exist')
    cy.get('[data-cy="tag-OURSINS,ETC. NCA (URX)"]').should('exist')
    cy.get('[data-cy="tag-Dragues"]').should('exist')
    cy.get('[data-cy="input-Praires Ouest cotentin"]').should('exist')
    cy.get('.rs-picker-toggle-value').eq(0).should('have.text', getDate(new Date().toISOString()))

    // Then try to save
    cy.get('[data-cy="validate-button"]').contains('Enregister les modifications')
    cy.get('[data-cy="validate-button"]').click()
    cy.get('.rs-checkbox-wrapper').should('have.css', 'border-top-color', 'rgb(225, 0, 15)')
  })

  it('Select another law type should reset selected layer name', () => {
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="R(CE) 494/2002"]').eq(0).scrollIntoView().click()
    cy.get('[data-cy="tag-Ouest Cotentin Bivalves"]').should('not.exist')
  })

  it('A species Should be removed', () => {
    // Given
    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })
    cy.get('*[data-cy^="regulation-authorized-species"]').click({ force: true })
    cy.get('.rs-picker-toggle-placeholder')
      .filter(':contains("des espèces")')
      .scrollIntoView()
      .click({ timeout: 20000 })

    // When
    cy.get('[data-cy="close-tag-OURSINS NCA (URC)"]').click()

    // Then
    cy.get('[data-cy="tag-OURSINS NCA (URC)"]').should('not.exist')
  })

  it('Save regulation Should send the update payload to Geoserver and go back to backoffice page', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    // complete missing values in form
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })

    // When save form
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)

    // Then
    cy.wait('@postRegulation')
      .then(({ request, response }) => {
        expect(request.body).contain('typeName="monitorfish:regulations_write"')
        expect(request.body).contain('<Value>Reg. MEMN</Value>')
        expect(request.body).contain('<Value>Praires Ouest cotentin</Value>')
        expect(request.body).contain('<Value>Normandie, Bretagne</Value>')
        expect(request.body).contain('"reference":"texte de reference"')
        expect(request.body).contain('"url":"http://legipeche.metier.i2/arrete-prefectoral-168-2020-modifie-delib-2020-pr-a10301.html?id_rub=634"')
        expect(request.body).not.equal('"startDate":""')
        expect(request.body).contain('"endDate":"infinite"')
        expect(request.body).contain('"textType":["creation"]')
        expect(request.body).contain('<FeatureId fid="regulations_write.598"/>')
        expect(response.statusCode).equal(200)
      })
    cy.url().should('include', '/backoffice')
  })

  it('Save regulation Should send the regulated species and gears updates object to Geoserver', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    // complete missing values in form
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })
    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })
    cy.get('*[data-cy^="regulation-authorized-species"]').click({ force: true })
    cy.scrollTo(0, 500)

    cy.get('.rs-picker-toggle-placeholder')
      .filter(':contains("catégories d\'espèces")')
      .scrollIntoView()
      .click({ timeout: 20000 })
    cy.get('.rs-picker-search-bar-input').type('Espèce{enter}')
    cy.get('.rs-picker-toggle-placeholder')
      .filter(':contains("des espèces")')
      .click({ timeout: 20000 })
    cy.get('.rs-picker-search-bar-input').type('HKE{enter}')
    cy.get('*[data-cy^="regulatory-species-quantity"]').eq(0).type('Ne pas en prendre beaucoup please')
    cy.get('*[data-cy^="regulatory-species-minimum-size"]').eq(0).type('à peu près 60 cm')
    cy.get('*[data-cy^="regulatory-species-other-info"]').type('Mhm pas d\'autre info !')

    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })
    cy.get('*[data-cy^="regulatory-gears-section"]').click({ force: true })
    cy.get('*[data-cy="gears-selector"]')
      .scrollIntoView()
    cy.get('.rs-picker-select')
      .filter(':contains("inférieur à")')
      .click({ timeout: 20000 })
    cy.get('.rs-picker-select-menu-item')
      .eq(3)
      .click({ timeout: 20000 })

    // When
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)

    // Then
    cy.wait('@postRegulation')
      .then(({ request, response }) => {
        expect(request.body)
          .contain('"authorized":true')
          .contain('"otherInfo":"Mhm pas d\'autre info !"')
          .contain('{"species":[{"code":"URC","quantity":"500 kgNe pas en prendre beaucoup please","name":"OURSINS NCA",' +
            '"minimumSize":"à peu près 60 cm"},{"code":"URX","quantity":"500 kg","name":"OURSINS,ETC. NCA"},{"code":"HKE","name":"MERLU D\'EUROPE"}],' +
            '"authorized":true,"speciesGroups":["Espèces eau profonde"]')
          .contain('{"allGears":false,"otherInfo":"Drague sans dent et de largeur maximale 1,30 mètre","authorized":true,' +
            '"allTowedGears":false,"regulatedGears":{"TBN":{"code":"TBN","name":"Chaluts à langoustines","category":"Chaluts",' +
            '"groupId":1,"meshType":"lowerThanOrEqualTo","mesh":["123"]}},"allPassiveGears":false,' +
            '"regulatedGearCategories":{"Dragues":{"name":"Dragues"}},"selectedCategoriesAndGears":["Dragues","TBN"]}')

        expect(response.statusCode).equal(200)
      })
    cy.url().should('include', '/backoffice')
  })

  it('Confirm modal is closed on confirm button click and post request is sent', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })

    // When
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()

    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.wait('@postRegulation')
      .then(({ request, response }) => {
        expect(response.statusCode).equal(200)
      })
    cy.url().should('include', '/backoffice')
  })

  it('If a value is missing, the confirm modal is opened and a warning message is displayed if saving', () => {
    // When
    cy.get('[data-cy="close-tag-Ouest Cotentin Bivalves"]').click()
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()

    // Then
    cy.get('[data-cy="save-forbidden-btn"]').should('exist')
  })

  it('A modal should not be opened on go back button click, if nothing has been modified', () => {
    // When
    cy.get('[data-cy="go-back-link"]').eq(0).click()

    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.url().should('include', '/backoffice')
  })

  it('Form values should be kept when F5 is pressed', () => {
    // When F5 is pressed
    cy.reload()
    // then form values are kept
    cy.get('[data-cy^="tag"]').should('have.length', 9)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-Ouest Cotentin Bivalves"]').should('exist')
    cy.get('[data-cy="tag-Normandie"]').should('exist')
    cy.get('[data-cy="tag-Bretagne"]').should('exist')
    cy.get('[data-cy="tag-598"]').should('exist')
    cy.get('[data-cy="tag-texte de reference"]').should('exist')
    cy.get('[data-cy="input-Praires Ouest cotentin"]').should('exist')
    cy.get('.rs-picker-toggle-value').eq(0).should('have.text', getDate(new Date().toISOString()))
  })
})
