/* eslint-disable no-undef */
/// <reference types="cypress" />
import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('NewRegulation', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice/regulation`)
    cy.wait(500)

    // Open a regulation to edit
    cy.get('[data-cy="law-type"]').should('have.length', 3)
    cy.get('[data-cy="law-type"]').eq(1).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-zone"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-zone"]').eq(0).trigger('mouseover', { force: true })
    cy.get('[data-cy="regulatory-layer-zone-edit"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-zone-edit"]').eq(0).click()
    cy.url().should('include', '/regulation/edit')
    cy.wait(500)
  })

  it('A layer zone Should be edited', () => {
    // When check expected form values
    cy.get('[data-cy^="tag"]').should('have.length', 6)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-Ouest_Cotentin_Bivalves"]').should('exist')
    cy.get('[data-cy="tag-Normandie"]').should('exist')
    cy.get('[data-cy="tag-Bretagne"]').should('exist')
    cy.get('[data-cy="tag-598"]').should('exist')
    cy.get('[data-cy="tag-texte de reference"]').should('exist')
    cy.get('[data-cy="input-Praires_Ouest_cotentin"]').should('exist')
    cy.get('.rs-picker-toggle-value').eq(0).should('have.text', getDate(new Date().toISOString()))

    // Then try to save
    cy.get('[data-cy="validate-button"]').contains('Enregister les modifications')
    cy.get('[data-cy="validate-button"]').click()
    cy.get('.rs-checkbox-wrapper').should('have.css', 'border-top-color', 'rgb(225, 0, 15)')
  })

  it('Select another law type should reset selected layer name', () => {
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('[data-key="R(CE) 494/2002"]').eq(0).click()
    cy.get('[data-cy="tag-Ouest_Cotentin_Bivalves"]').should('not.exist')
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
        expect(request.body).contain('typeName="monitorfish:regulatory_areas_write"')
        expect(request.body).contain('<Value>Reg. MEMN</Value>')
        expect(request.body).contain('<Value>Praires_Ouest_cotentin</Value>')
        expect(request.body).contain('<Value>Normandie, Bretagne</Value>')
        expect(request.body).contain('"reference":"texte de reference"')
        expect(request.body).contain('"url":"http://legipeche.metier.i2/arrete-prefectoral-168-2020-modifie-delib-2020-pr-a10301.html?id_rub=634"')
        expect(request.body).not.equal('"startDate":""')
        expect(request.body).contain('"endDate":"infinite"')
        expect(request.body).contain('"textType":["creation"]')
        expect(request.body).contain('<FeatureId fid="regulatory_areas_write.598"/>')
        expect(response.statusCode).equal(200)
      })
    cy.url().should('include', '/backoffice')
  })

  it('Save regulation Should send the regulated species update object to Geoserver', () => {
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
      .click({ timeout: 20000 })
    cy.get('.rs-picker-search-bar-input').type('Espèce{enter}')
    cy.get('.rs-picker-toggle-placeholder')
      .filter(':contains("des espèces")')
      .click({ timeout: 20000 })
    cy.get('.rs-picker-search-bar-input').type('HKE{enter}')
    cy.get('*[data-cy^="regulatory-species-quantity"]').type('Ne pas en prendre beaucoup please')
    cy.get('*[data-cy^="regulatory-species-minimum-size"]').type('à peu près 60 cm')
    cy.get('*[data-cy^="regulatory-species-other-info"]').type('Mhm pas d\'autre info !')

    // When
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)

    // Then
    cy.wait('@postRegulation')
      .then(({ request, response }) => {
        expect(request.body)
          .contain('"authorized":true')
          .contain('"otherInfo":"Mhm pas d\'autre info !"')
          .contain('"species":[{"code":"HKE","quantity":"Ne pas en prendre beaucoup please","minimumSize":"à peu près 60 cm"}]')
          .contain('"speciesGroups":["Espèces eau profonde"]')

        expect(response.statusCode).equal(200)
      })
    cy.url().should('include', '/backoffice')
  })

  it('Confirm modal is closed on confirm button click and post request is sent', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })
    // When
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    // Then
    cy.wait('@postRegulation')
      .then(({ request, response }) => {
        expect(response.statusCode).equal(200)
      })
    cy.url().should('include', '/backoffice')
  })
})
