/* eslint-disable no-undef */

context('Vessel sidebar reporting tab', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('An infraction suspicion reporting Should be added from the reporting form', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept(
      'GET',
      '/bff/v1/vessels/reporting?internalReferenceNumber=ABC000939217&externalReferenceNumber=RU460262&IRCS=SC6082&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    createReporting()

    // Then
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Cross Etel / Sortie non autorisée')
    cy.get('*[data-cy="reporting-card"]')
      .eq(0)
      .contains("Ce navire ne devrait pas être en mer, il n'a plus de points sur son permis")
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Émetteur: Jean Bon (0612365896)')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('NATINF 2608')

    // The reporting should be found in the reporting tab of the side window
    cy.visit('/side_window')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)
    cy.get('*[data-cy="side-window-current-reportings"]').last().contains('FRAIS AVIS MODE')

    // Delete the newly created reporting
    cy.get('.rs-checkbox').last().click()
    cy.get('[title="Archiver 1 signalement"]').click()
  })

  it('An observation reporting should be modified to an Infraction suspicion', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('ABC000597493')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept(
      'GET',
      '/bff/v1/vessels/reporting?internalReferenceNumber=ABC000597493&externalReferenceNumber=CMQ7994&IRCS=JL026591&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    // Create an new Observation
    cy.get('*[data-cy="vessel-sidebar-open-reporting"]').click()
    cy.get('[data-cy="new-reporting-select-observation-reporting-type"]').click()
    cy.get('*[data-cy="new-reporting-reporting-actor-UNIT"]').click()
    cy.get('*[data-cy="new-reporting-select-unit"]').click()
    cy.get('[data-key="10012"] > .rs-picker-select-menu-item').click({ force: true })
    cy.get('*[data-cy="new-reporting-author-contact"]').type('Jean Bon (0612365896)')
    cy.get('*[data-cy="new-reporting-title"]').type('Observation: Sortie non autorisée')
    cy.get('*[data-cy="new-reporting-description"]').type(
      'Ce navire ne devrait pas être en mer, mais ceci est une observation.'
    )
    cy.get('*[data-cy="new-reporting-author-trigram"]').type('NTP')
    cy.intercept('*reporting*').as('createReporting')
    cy.get('*[data-cy="new-reporting-create-button"]').scrollIntoView().click()
    cy.wait('@createReporting')

    cy.intercept('*update*').as('updateReporting')
    cy.get('*[data-cy^="edit-reporting-card"]').first().click({ timeout: 10000 })
    cy.get('*[data-cy="new-reporting-select-infraction-reporting-type"]').click({ timeout: 10000 })
    cy.get('*[data-cy="new-reporting-select-natinf"]').click()
    cy.get('[data-key="7059"] > .rs-picker-select-menu-item').click({ force: true })
    cy.get('*[data-cy="new-reporting-create-button"]').scrollIntoView().click()
    cy.wait('@updateReporting')
    cy.wait(50)

    cy.get('*[data-cy="reporting-card"]').first().contains('NATINF 7059')
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).click()
    // Then, we confirm the reporting deletion
    cy.get('*[data-cy="confirm-reporting-deletion-button"]').click()
  })

  it('Reporting Should be archived', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.intercept(
      'GET',
      '/bff/v1/vessels/reporting?internalReferenceNumber=ABC000939217&externalReferenceNumber=RU460262&IRCS=SC6082&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    createReporting()

    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Cross Etel / Sortie non autorisée')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('NATINF 2608')
    cy.get('*[data-cy="archive-reporting-card"]').eq(0).click()

    // Then
    cy.get('*[data-cy="reporting-card"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history-button"]').click()
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history"]').should('exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-archive-year"]').eq(0).click()
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Cross Etel / Sortie non autorisée')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })

  it('Reporting Should be deleted', () => {
    cy.intercept(
      'GET',
      '/bff/v1/vessels/reporting?internalReferenceNumber=ABC000939217&externalReferenceNumber=RU460262&IRCS=SC6082&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 10000 }).type('FRAIS avis')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 10000 }).eq(0).click()
    cy.wait(50)
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 10000 }).should('be.visible')

    // When
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    createReporting()

    // When
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Cross Etel / Sortie non autorisée')
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).click()
    // First, we do not confirm the reporting deletion
    cy.get('*[data-cy="close-reporting-deletion-modal"]').click()
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).click()
    // Then, we confirm the reporting deletion
    cy.get('*[data-cy="confirm-reporting-deletion-button"]').click()

    // Then
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })

  function createReporting() {
    cy.get('*[data-cy="vessel-sidebar-open-reporting"]').click()
    cy.get('*[data-cy="new-reporting-reporting-actor-UNIT"]').click()
    cy.get('*[data-cy="new-reporting-select-unit"]').click()
    cy.get('[data-key="10012"] > .rs-picker-select-menu-item').click({ force: true })
    cy.get('*[data-cy="new-reporting-author-contact"]').type('Jean Bon (0612365896)')
    cy.get('*[data-cy="new-reporting-title"]').type('Sortie non autorisée')
    cy.get('*[data-cy="new-reporting-description"]').type(
      "Ce navire ne devrait pas être en mer, il n'a plus de points sur son permis"
    )
    cy.get('*[data-cy="new-reporting-author-trigram"]').type('LTH')
    cy.get('*[data-cy="new-reporting-select-natinf"]').click()
    cy.get('[data-key="2608"] > .rs-picker-select-menu-item').click({ force: true })
    cy.intercept('*reporting*').as('createReporting')
    cy.get('*[data-cy="new-reporting-create-button"]').scrollIntoView().click()
    cy.wait('@createReporting')
  }
})
