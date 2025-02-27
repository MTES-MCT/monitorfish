context('Measurement', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)
  })

  it('A circle range measurement Should be created', () => {
    /**
     * A circle range measurement Should be created When clicking on the map
     */
    // When
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('body').click(490, 580, { timeout: 10000 })
    cy.get('body').click(450, 585, { timeout: 10000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 5.', { timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')

    /**
     * A circle range measurement Should be created When the radius in entered in input
     */
    // When
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('body').click(490, 580, { timeout: 10000 })
    cy.get('*[data-cy="dms-coordinates-input"]').should('have.value', '47° 42′ 07″ N 007° 54′ 51″ W')
    cy.get('*[data-cy="measurement-circle-radius-input"]').type('35', { timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-add"]').click({ timeout: 10000 })
    cy.wait(500)

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 35 nm', { timeout: 10000 })
    cy.get('body').type('-', { force: true }) // Because of the throttle, we de-zoom to hide labels
    cy.get('*[data-cy="close-measurement"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')

    /**
     * A circle range measurement Should be created When the coordinates and radius are entered in input
     */
    // When
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('*[data-cy="dms-coordinates-input"]').type('470123N0070123W', { timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-radius-input"]').type('47', { timeout: 10000 })
    cy.get('*[data-cy="measurement-circle-add"]').click({ timeout: 10000 })
    cy.wait(500)

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('r = 47 nm', { timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('A multi line range measurement Should be created When clicking on the map', () => {
    // When
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.wait(400)
    // Close then re-open
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.wait(400)
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement-multiline"]').click({ timeout: 10000 })
    cy.get('body').click(490, 580, { timeout: 10000 })
    cy.get('body').click(420, 635, { timeout: 10000 })
    cy.get('body').dblclick(560, 620, { timeout: 10000 })

    // Then
    cy.get('*[data-cy="measurement-value"]').contains('31.46', { timeout: 10000 })
    cy.get('body').click(590, 590, { timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })

  it('Many measurements Should be created When clicking on the map', () => {
    // When
    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('body').click(490, 580, { timeout: 10000 })
    cy.get('body').click(450, 585, { timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('have.length', 1)

    cy.clickButton("Mesurer une distance", { withoutScroll: true })
    cy.get('*[data-cy="measurement-circle-range"]').click({ timeout: 10000 })
    cy.get('*[data-cy="dms-coordinates-input"]', { timeout: 10000 }).should(
      'have.value',
      '__° __′ __″ _ ___° __′ __″ _'
    )
    cy.get('body').click(690, 680, { timeout: 10000 })
    cy.get('body').click(750, 785, { timeout: 10000 })
    cy.wait(500)
    cy.get('*[data-cy="measurement-value"]').should('have.length', 2)

    // Then
    cy.get('*[data-cy="measurement-value"]').eq(1).contains('r = 5.', { timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').eq(1).click({ timeout: 10000 })
    cy.get('*[data-cy="close-measurement"]').eq(0).click({ timeout: 10000 })
    cy.get('*[data-cy="measurement-value"]').should('not.exist')
  })
})
