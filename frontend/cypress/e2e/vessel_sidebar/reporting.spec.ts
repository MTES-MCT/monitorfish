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
      '/bff/v1/vessels/reporting?vesselId=6&internalReferenceNumber=ABC000939217&externalReferenceNumber=RU460262&IRCS=SC6082&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    createReporting()

    // Then
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
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
    cy.get('*[data-cy="ReportingList-reporting"]').last().contains('FRAIS AVIS MODE')

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
      '/bff/v1/vessels/reporting?vesselId=11&internalReferenceNumber=ABC000597493&externalReferenceNumber=CMQ7994&IRCS=JL026591&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    // Create an new Observation
    cy.clickButton('Ouvrir un signalement')
    cy.fill('Type', 'Observation')
    cy.fill('Origine', 'Unité')
    cy.fill("Choisir l'unité", 'OFB SD 56 (Office Français de la Biodiversité)')
    cy.fill('Nom et contact (numéro, mail…) de l’émetteur', 'Jean Bon (0612365896)')
    cy.fill('Titre', 'Observation: Sortie non autorisée')
    cy.fill('Description', 'Ce navire ne devrait pas être en mer, mais ceci est une observation.')
    cy.fill('Saisi par', 'NTP')
    cy.intercept('*reporting*').as('createReporting')
    cy.clickButton('Valider')
    cy.wait('@createReporting')

    cy.intercept('*update*').as('updateReporting')
    cy.get('*[data-cy^="edit-reporting-card"]').first().click({ timeout: 10000 })
    cy.get('*[data-cy="new-reporting-select-infraction-reporting-type"]').click({ timeout: 10000 })
    cy.fill('Natinf', '7059')
    cy.clickButton('Valider')
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
      '/bff/v1/vessels/reporting?vesselId=6&internalReferenceNumber=ABC000939217&externalReferenceNumber=RU460262&IRCS=SC6082&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 10000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 10000 }).should('be.visible')
    cy.wait('@reporting')
    cy.wait(100)

    createReporting()

    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('NATINF 2608')
    cy.get('*[data-cy="archive-reporting-card"]').eq(0).click()

    // Then
    cy.get('*[data-cy="reporting-card"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history-button"]').click()
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history"]').should('exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-archive-year"]').eq(0).click()
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
  })

  it('Reporting Should be deleted', () => {
    cy.intercept(
      'GET',
      '/bff/v1/vessels/reporting?vesselId=6&internalReferenceNumber=ABC000939217&externalReferenceNumber=RU460262&IRCS=SC6082&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
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
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('OFB SD 56 / Sortie non autorisée')
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
    cy.intercept('*reporting*').as('createReporting')

    cy.clickButton('Ouvrir un signalement')

    cy.fill('Origine', 'Unité')
    cy.fill("Choisir l'unité", 'OFB SD 56 (Office Français de la Biodiversité)')
    cy.fill('Nom et contact (numéro, mail…) de l’émetteur', 'Jean Bon (0612365896)')
    cy.fill('Titre', 'Sortie non autorisée')
    cy.fill('Description', "Ce navire ne devrait pas être en mer, il n'a plus de points sur son permis")
    cy.fill('Natinf', '2608')
    cy.fill('Saisi par', 'LTH')

    cy.clickButton('Valider')
    cy.wait('@createReporting')
  }
})
