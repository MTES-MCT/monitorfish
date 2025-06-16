context('InterestPoint', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)
  })

  it('An interest point Should be created When clicking on the map', () => {
    // When
    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('#root').click(490, 580, { timeout: 10000 })

    // Then
    cy.get('*[data-cy^="interest-point-name-input"]').type('Phénomène')
    cy.get('*[data-cy^="interest-point-observations-input"]').type('Est dans la bergerie')

    cy.get('*[data-cy^="interest-point-name"]').first().contains('Phénomène', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-observations"]').first().contains('Est dans la bergerie', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47° 4', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('N', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('007° 5', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('W', { timeout: 10000 })

    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
  })

  it('Multiple interest points Should be created When clicking on the map', () => {
    // When
    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('*[data-cy="interest-point-name-input"]').type('Phénomène')
    cy.get('*[data-cy="interest-point-observations-input"]').type('Est dans la bergerie')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
    cy.get('*[data-cy="edit-interest-point"]').should('be.visible')
    cy.get('*[data-cy="interest-point-observations"]').contains('Est dans la bergerie', { timeout: 10000 })
    cy.get('*[data-cy="interest-point-observations"]').should('have.length', 1)
    cy.wait(300)

    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 10000 })
      .should('have.value', '47° 51′ 23″ N 007° 24′ 25″ W')
    cy.get('#root').click(300, 430, { timeout: 10000 })
    cy.get('*[data-cy="interest-point-name-input"]').type('Phénomène 2')
    cy.get('*[data-cy="interest-point-observations-input"]').type('Est encore dans la bergerie')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
    cy.get('*[data-cy="edit-interest-point"]').should('be.visible')
    cy.get('*[data-cy="interest-point-observations"]').should('have.length', 2)
    cy.get('*[data-cy="interest-point-observations"]').contains('Est encore dans la bergerie', { timeout: 10000 })
    cy.wait(300)

    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 10000 })
      .should('have.value', '47° 51′ 23″ N 007° 24′ 25″ W')
    cy.get('#root').click(650, 690, { timeout: 10000 })
    cy.get('*[data-cy="interest-point-name-input"]').type('Phénomène 3')
    cy.get('*[data-cy="interest-point-observations-input"]').type('Est encore encore dans la bergerie')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
    cy.get('*[data-cy="edit-interest-point"]').should('be.visible')
    cy.get('*[data-cy="interest-point-observations"]').should('have.length', 3)
    cy.get('*[data-cy="interest-point-observations"]')
      .contains('Est encore encore dans la bergerie', { timeout: 10000 })
  })

  it('An interest Should be created from input When DD coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ force: true, timeout: 10000 })
    cy.get('#root').click(159, 1000, { timeout: 10000 })
    cy.get('*[data-cy="coordinates-selection-dd"]').click({ timeout: 10000 })
    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })

    // Then
    cy.get('*[data-cy^="coordinates-dd-input-lat"]').clear()
    cy.get('*[data-cy^="coordinates-dd-input-lon"]').clear()
    cy.get('*[data-cy^="coordinates-dd-input-lat"]').type('47.5525')
    cy.get('*[data-cy^="coordinates-dd-input-lon"]').type('-7.5563')

    cy.get('*[data-cy^="interest-point-name"]').first().contains('Aucun Libellé', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-observations"]').first().contains('Aucune observation', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47.5525° -007.5563°', { timeout: 10000 })

    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
  })

  it('An interest Should be edited When DMD coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ force: true, timeout: 10000 })
    cy.get('#root').click(159, 1000, { timeout: 10000 })
    cy.get('*[data-cy="coordinates-selection-dmd"]').click({ timeout: 10000 })
    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
    cy.wait(300)
    cy.get('*[data-cy="interest-point-edit"]').click({ timeout: 10000 })
    cy.get('*[data-cy="dmd-coordinates-input"]')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}500W')

    // Then
    cy.get('*[data-cy^="interest-point-coordinates"]')
      .first()
      .contains('47° 42.111′ N 007° 54.500′ W', { timeout: 10000 })
  })

  it('An interest Should be edited with East value When DMS coordinates are selected', () => {
    // When
    cy.get('*[data-cy="coordinates-selection"]').click({ force: true, timeout: 10000 })
    cy.get('#root').click(159, 1000, { timeout: 10000 })
    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.fill('Type de point', 'Autre point')

    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
    cy.wait(300)
    cy.get('[data-cy="interest-point-edit"]').click({ timeout: 10000 })
    // The interest point is moved to the East side
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 10000 }).type('{backspace}E')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })

    // Then
    cy.get('#root').click(536, 600, { timeout: 10000 })
    cy.get('*[data-cy="edit-interest-point"]').should('not.be.visible')

    cy.wait(300)
    cy.get('*[data-cy="interest-point-edit"]').should('not.be.visible')
    cy.get('*[data-cy="interest-point-edit"]').click({ force: true })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 10000 })
      .should('have.value', '47° 42′ 07″ N 007° 54′ 51″ E')
    cy.get('.Field-MultiRadio').contains('Type de point').get('[aria-checked="true"]').contains('Autre point')
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })

    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('47° 42′', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('N', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('007° 54′', { timeout: 10000 })
    cy.get('*[data-cy^="interest-point-coordinates"]').first().contains('E', { timeout: 10000 })
  })

  it('An interest Should be deleted When it is in edit mode', () => {
    // When
    cy.clickButton('Créer un point d\'intérêt', { withoutScroll: true })
    cy.get('#root').click(490, 580, { timeout: 10000 })
    cy.get('*[data-cy="interest-point-save"]').click({ timeout: 10000 })
    cy.wait(300)
    cy.get('*[data-cy="interest-point-edit"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="interest-point-observations-input"]').type('Est dans la bergerie')
    cy.get('*[data-cy="interest-point-delete"]').click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy="interest-point-observations-input"]').should('have.value', '')
  })
})
