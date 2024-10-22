context('Load offline', () => {
  /**
   * This test can't be runned as `navigator.serviceWorker` is not available in Cypress
   */
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Should download tiles in the Cache API with the Service Worker', () => {
    // Given
    cy.visit('/load_offline')
    cy.get('*[data-cy="load-offline-downloaded-tiles"]').eq(0).contains('0 tuiles sauvegardées')

    // When
    cy.clickButton('Télécharger')
    cy.wait(500)

    // Then
    cy.get('body').contains('Toutes les données ont été chargées.', { timeout: 50000 })
    cy.get('*[data-cy="load-offline-downloaded-tiles"]').eq(0).contains('32 tuiles sauvegardées')
  })
})
