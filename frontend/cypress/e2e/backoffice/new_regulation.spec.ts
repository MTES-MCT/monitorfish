/* eslint-disable no-undef */

context('New Regulation', () => {
  beforeEach(() => {
    cy.visit('/backoffice/regulation/new')
    cy.wait(1000)
  })

  it('Law type list contains 18 elements', () => {
    cy.get('.rs-picker-toggle-placeholder').eq(0).should('have.text', 'Choisir un ensemble')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    // This input is virtualized, 7 out of the 18 items are not yet rendered
    cy.get('.rs-picker-select-menu-item').should('exist').should('have.length', 11)
  })

  it('Select, change and remove law type Reg. MEMN', () => {
    // Open menu and select "Reg. MEMN",  the tag is displayed
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. MEMN"]').click({ force: true })
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')

    // Change selected law type, select "Reg. NAMO"
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. NAMO"]').click({ force: true })
    cy.get('[data-cy="tag-Reg. NAMO"]').should('exist')

    // Remove tag
    cy.get('[data-cy="close-tag-Reg. NAMO"]').click()
    cy.get('[data-cy="tag-Reg. NAMO"]').should('not.exist')
  })

  it('Change law type update the layer name list', () => {
    // Select Reg. MEMN in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. MEMN"]').eq(0).click({ force: true })
    // Select the first layer name in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(1).click()
    cy.wait(200)
    cy.get('[data-key="Ouest Cotentin Bivalves"]').should('exist')

    // Select Reg. NAMO law type in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. NAMO"]').eq(0).click({ force: true })
    // Select the first layer name in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(1).click()
    // layer name should have changed
    cy.wait(200)
    cy.get('[data-key="Armor CSJ Dragues"]').should('exist')
  })

  it('select UE law_type should display an empty list', () => {
    // Select R(CE) 494/2002 in the dropdown menu
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    // Since this input is virtualized, we need to scroll and wait for it to render new items
    cy.get('.rs-picker-select-menu-items > div > div').eq(0).scrollTo(0, 500).wait(500)
    cy.get('[data-key="R(CE) 494/2002"]').eq(0).click({ force: true })

    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(1).click({ force: true })
    cy.get('.rs-picker-none').contains('aucune thématique à afficher')
  })

  it('Adding a zone name change input background', () => {
    cy.get('.rs-input').eq(0).type('new zone name')
    cy.get('.rs-input').eq(0).should('have.css', 'background-color', 'rgb(229, 229, 235)')
    cy.get('.rs-input').eq(0).clear()
    cy.get('.rs-input').eq(0).should('have.css', 'background-color', 'rgb(255, 255, 255)')
  })

  it('If a french law type has been selected, region list contains 13 elements', () => {
    // Select a french law type
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. MED"]').eq(0).click({ force: true })
    // Region select picker should not be disabled
    cy.get('.rs-picker-toggle-placeholder').eq(2).should('have.text', 'Choisir une région')
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    // Region list length should be equal to 18
    cy.get('.rs-picker-select-menu-items').should('exist').should('have.length', 1)
    // This input is virtualized, 7 out of the 18 items are not yet rendered
    cy.get('.rs-picker-select-menu-item').should('exist').should('have.length', 11)
  })

  it('If a EU law type has been selected, region list should be disabled', () => {
    // Select a EU law type
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    // Since this input is virtualized, we need to scroll and wait for it to render new items
    cy.get('.rs-picker-select-menu-items > div > div').eq(0).scrollTo(0, 500).wait(500)
    cy.wait(200)
    cy.get('[data-key="R(UE) 2019/1241"]').eq(0).click({ force: true })
    // Region select picker should be disabled
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).should('have.attr', 'aria-disabled', 'true')
  })

  it('Select "Grand Est" and "Auvergne-Rhône-Alpes" region and remove it', () => {
    // Select a french law type
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. MED"]').eq(0).click({ force: true })
    // Select "Auvergne-Rhône-Alpes" region
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.wait(200)
    cy.get('[data-key="Auvergne-Rhône-Alpes"]').click({ force: true })
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('exist')
    // Select "Grand Est" region
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.wait(200)
    cy.get('[data-key="Grand Est"]').click({ force: true })
    cy.get('[data-cy="tag-Grand Est"]').should('exist')
    // 3 tags exists (1 seafront and 2 regions)
    cy.get('[data-cy^="tag"]').should('have.length', 3)
    // Remove tag
    cy.get('[data-cy="close-tag-Auvergne-Rhône-Alpes"]').click()
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('not.exist')
    // 3 tags still exists (1 seafront and 1 regions)
    cy.get('[data-cy^="tag"]').should('have.length', 2)
  })

  it('Enter a reg text name with a valid url', () => {
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('http://url.com')
    // When button is clicked
    cy.get('[data-cy="save-reg-text-name"]').click()
    // Tag appeared
    cy.get('[data-cy="tag-zone name"]').should('exist')
    // When close icon is clicked
    cy.get('[data-cy="close-tag-zone name"]').click()
    // Tag disappeared
    cy.get('[data-cy="tag-zone name"]').should('not.exist')
  })

  it('Enter and clear reg zone name form', () => {
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('http://url.com')
    // When button is clicked
    cy.get('[data-cy="clear-reg-text-name"]').click()
    cy.get('[data-cy="reg-text-name"]').invoke('val').should('equal', '')
    cy.get('[data-cy="reg-text-url"]').invoke('val').should('equal', '')
  })

  it('A modal should be open on go back button click', () => {
    // When
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('https://url.com')
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    // then
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-text"]').should(
      'have.text',
      'Voulez-vous enregistrer les modifications\napportées à la réglementation ?'
    )
  })

  it('Confirm modal is closed on close icon click', () => {
    // Given
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('https://url.com')
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    // When
    cy.get('[data-cy="confirm-modal-close-icon"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
  })

  it('Confirm modal is closed on confirm button click and error is displayed', () => {
    // Given
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('https://url.com')
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    // When
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.get('[data-cy="save-forbidden-btn"]').should('exist')
  })

  it('New regulation page is closed and backoffice list is displayed on cancel button click', () => {
    // Given
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('https://url.com')
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    // When
    cy.get('[data-cy="confirm-modal-cancel-button"]').click()
    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.url().should('include', '/backoffice')
  })

  it('Check and uncheck of all gears Should add or remove all gears', () => {
    // Given
    cy.get('[data-cy="authorized-all-towed-gears-option"]').should('exist')
    cy.get('[data-cy="authorized-all-passive-gears-option"]').should('exist')
    cy.get('[data-cy="unauthorized-all-towed-gears-option"]').should('exist')
    cy.get('[data-cy="unauthorized-all-passive-gears-option"]').should('exist')
    cy.get('[data-cy="authorized-gears-selector"]').should('exist')
    cy.get('[data-cy="unauthorized-gears-selector"]').should('exist')

    // when
    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click()
    cy.wait(1000)
    cy.get('[data-cy="unauthorized-all-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
    cy.get('[data-cy="unauthorized-all-gears-option"]').click()

    // then
    cy.get('[data-cy="unauthorized-all-towed-gears-option"]').should('have.class', 'rs-checkbox-checked')
    cy.get('[data-cy="unauthorized-all-passive-gears-option"]').should('have.class', 'rs-checkbox-checked')
    cy.get('[data-cy^="tag-"]').should('have.length', 12)
    cy.get('[data-cy="unauthorized-all-gears-option"]').click()

    cy.get('[data-cy="unauthorized-all-towed-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
    cy.get('[data-cy="unauthorized-all-passive-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
    cy.get('[data-cy^="tag-"]').should('have.length', 0)
  })

  it('Check all towed gear displays a list of towed gear categories', () => {
    // Given
    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click()
    // when
    cy.get('[data-cy="authorized-all-towed-gears-option"]').click()
    // then
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 4)
    cy.get('[data-cy="mesh-label"]').should('have.length', 2)
    // when
    cy.get('[data-cy="close-tag-Sennes traînantes"]').scrollIntoView().click()
    // then
    cy.get('[data-cy="tag-Sennes traînantes"]').should('not.exist')
    cy.get('[data-cy="authorized-all-towed-gears-option"]').should('not.be.checked')
  })

  it('Check all passive gears display a list of passive gear categories', () => {
    // Given
    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click()
    // when
    cy.get('[data-cy="authorized-all-passive-gears-option"]').scrollIntoView().click()
    // then
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 6)
    cy.get('[data-cy="mesh-label"]').should('have.length', 3)
    // when
    cy.get('[data-cy="close-tag-Sennes tournantes coulissantes"]').scrollIntoView().click()
    // then
    cy.get('[data-cy="tag-Sennes tournantes coulissantes"]').should('not.exist')
    cy.get('[data-cy="authorized-all-passive-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
  })

  it('Modification of inputs Should be kept in local storage when refreshing the page', () => {
    // Given
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    cy.wait(200)
    cy.get('[data-key="Reg. MEMN"]').eq(0).click({ force: true })
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(2).click()
    cy.wait(200)
    cy.get('[data-key="Auvergne-Rhône-Alpes"]').click({ force: true })
    cy.get('[data-cy="reg-text-name"]').type('zone name')
    cy.get('[data-cy="reg-text-url"]').type('http://url.com')
    cy.get('[data-cy="save-reg-text-name"]').click()
    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click()
    cy.get('[data-cy="authorized-all-towed-gears-option"]').click()
    cy.get('*[data-cy^="open-regulated-species"]').scrollIntoView().click({ force: true })
    cy.scrollTo(0, 500)
    cy.get('.rs-picker-toggle-placeholder').filter(':contains("catégories d\'espèces")').eq(0).click({ timeout: 10000 })
    cy.get('.rs-picker-search-bar-input').type('Espèce{enter}', { force: true })
    cy.get('.rs-picker-toggle-placeholder').filter(':contains("des espèces")').eq(0).click({ timeout: 10000 })
    cy.wait(200)
    cy.get('.rs-picker-search-bar-input').type('HKE{enter}', { force: true })

    // Values are found
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('exist')
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 4)
    cy.get('[data-cy="mesh-label"]').should('have.length', 2)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-zone name"]').should('exist')
    cy.get('[data-cy="tag-MERLU D\'EUROPE (HKE)"]').should('exist')
    cy.get('[data-cy="tag-Espèces eau profonde"]').should('exist')

    // When
    cy.reload()
    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click({ force: true })
    cy.get('*[data-cy^="open-regulated-species"]').scrollIntoView().click({ force: true })

    // Then
    cy.wait(50)
    cy.get('[data-cy="tag-Auvergne-Rhône-Alpes"]').should('exist')
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 4)
    cy.get('[data-cy="mesh-label"]').should('have.length', 2)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-zone name"]').should('exist')
    cy.get('[data-cy="tag-MERLU D\'EUROPE (HKE)"]').should('exist')
    cy.get('[data-cy="tag-Espèces eau profonde"]').should('exist')
  })
})
