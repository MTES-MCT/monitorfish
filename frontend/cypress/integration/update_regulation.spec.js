/* eslint-disable no-undef */
/// <reference types="cypress" />
import { getDate } from '../../src/utils'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('NewRegulation', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/backoffice`)
    cy.wait(2000)

    // Open a regulation to edit
    cy.get('[data-cy="law-type"]').should('have.length', 3)
    cy.get('[data-cy="law-type"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-zone"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-zone"]').eq(0).trigger('mouseover')
    cy.get('[data-cy="regulatory-layer-zone-edit"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-zone-edit"]').eq(0).click()
    cy.url().should('include', '/editRegulation')
    cy.wait(400)
  })

  it('Edit a layer zone', () => {
    // check expected form values
    cy.get('[data-cy="tag"]').should('have.length', 7)
    cy.get('[data-cy="tag-Reg locale / MEMN"]').should('exist')
    cy.get('[data-cy="tag-Ouest_Cotentin_Bivalves"]').should('exist')
    cy.get('[data-cy="tag-MEMN"]').should('exist')
    cy.get('[data-cy="tag-Normandie"]').should('exist')
    cy.get('[data-cy="tag-Bretagne"]').should('exist')
    cy.get('[data-cy="tag-598"]').should('exist')
    cy.get('[data-cy="tag-ArrÃªtÃ© PrÃ©fectoral 168/2020 ModifiÃ© - dÃ©lib 2020/PR-B-16 / MEMN"]').should('exist')
    cy.get('[data-cy="input-Praires_Ouest_cotentin"]').should('exist')
    cy.get('.rs-picker-toggle-value').eq(0).should('have.text', getDate(new Date().toISOString()))
    // try to save
    cy.get('[data-cy="validate-button"]').contains('Enregister les modifications')
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)
    cy.get('[date-cy="custom-date-picker"]').eq(1).should('have.css', 'border-color', 'rgb(225, 0, 15)')
    cy.get('.rs-checkbox-inner').should('have.length', 3)
    cy.get('.rs-checkbox-inner').before('border-color').should('eq', 'rgb(225, 0, 15)')
  })
  it('Save request open /backoffice page', () => {
    // listen Post request to /geoserver/wfs
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    cy.get('.rs-checkbox-inner').before('border-color').should('not.eq', 'rgb(225, 0, 15)')
    // complete missing values in form
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })
    // save form
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)
    cy.wait('@postRegulation').its('request.body').should('contain', '<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><Update typeName="monitorfish:regulatory_areas" xmlns:feature="monitorfish"><Property><Name>layer_name</Name><Value>Ouest_Cotentin_Bivalves</Value></Property><Property><Name>law_type</Name><Value>Reg locale</Value></Property><Property><Name>zones</Name><Value>Praires_Ouest_cotentin</Value></Property><Property><Name>region</Name><Value>Normandie, Bretagne</Value></Property><Property><Name>facade</Name><Value>MEMN</Value></Property><Property><Name>references_reglementaires</Name><Value>[{"reference":"ArrÃªtÃ© PrÃ©fectoral 168/2020 ModifiÃ© - dÃ©lib 2020/PR-B-16 / MEMN","url":"http://legipeche.metier.i2/arrete-prefectoral-168-2020-modifie-delib-2020-pr-a10301.html?id_rub=634","startDate":1635771799409,"endDate":"infinite","textType":["creation"]}]</Value></Property><Property><Name>references_reglementaires_a_venir</Name><Value>""</Value></Property><Filter xmlns="http://www.opengis.net/ogc"><FeatureId fid="regulatory_areas.598"/></Filter></Update></Transaction>')
  })
})
