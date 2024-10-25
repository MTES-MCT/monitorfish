/* eslint-disable no-undef */

context('BackOffice > Regulation Table > Behavior', () => {
  beforeEach(() => {
    cy.visit('/backoffice/regulation')
    cy.wait(200)
  })

  it('on mouse over layer name edit button appears', () => {
    // Given
    // listen Post request to /geoserver/wfs
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')

    cy.get('[data-cy="Reg. MEMN"]').eq(0).click()
    cy.get('[title="Ouest Cotentin Bivalves"]').trigger('mouseover', { force: true })
    cy.get('[data-cy="regulatory-topic-edit"]').should('be.visible')
    cy.get('[data-cy="regulatory-topic-edit"]').click({ force: true })
    cy.get('[data-cy="regulatory-topic-edit-input"]').should('exist')
    cy.get('[data-cy="regulatory-topic-edit-input"]').should('not.be.disabled')
    cy.get('[data-cy="regulatory-topic-edit-input"]').type(' - changed{enter}', { force: true })

    // When
    cy.get('[data-cy="regulatory-topic-edit-input"]').should('not.exist')

    cy.wait('@postRegulation').then(({ request, response }) => {
      expect(request.body).contain('typeName="monitorfish:regulations_write"')
      expect(request.body).contain('<Value>Ouest Cotentin Bivalves - changed</Value>')
      expect(response && response.statusCode).equal(200)
    })

    // Then
    cy.get('[data-cy="regulatory-layers-my-zones-topic"]').then(elements => {
      expect(elements.eq(0)).contain('Ouest Cotentin Bivalves - changed')
      expect(elements.eq(0).parent()).contain('1/1')
    })
  })
})
