/* eslint-disable no-undef */

context('BackOffice > Regulation Form > Creation', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/backoffice/regulation/new')
    cy.wait(1000)
  })

  it('Select, change and remove law type Reg. MEMN', () => {
    cy.get('[id="Choisir un ensemble"]').click()
    cy.get('[id="Choisir un ensemble-listbox"] > div').should('have.length', 19)
    cy.get('[id="Choisir un ensemble-listbox"]').type('{esc}')

    // Open menu and select "Reg. MEMN",  the tag is displayed
    cy.fill('Choisir un ensemble', 'Reg. MEMN')
    cy.get('.Component-SingleTag').contains('Reg. MEMN')

    // Change selected law type, select "Reg. NAMO"
    cy.fill('Choisir un ensemble', 'Reg. NAMO')
    cy.get('.Component-SingleTag').contains('Reg. NAMO')

    // Remove tag
    cy.get('.Component-SingleTag').filter(':contains("Reg. NAMO")').find('button').click()
    cy.get('.Component-SingleTag').should('not.exist')

    /**
     * Change law type update the layer name list
     */
    // Select Reg. MEMN in the dropdown menu
    cy.fill('Choisir un ensemble', 'Reg. MEMN')

    cy.fill('Choisir une thématique', 'Ouest Cotentin Bivalves')

    // Select Reg. NAMO law type in the dropdown menu
    cy.fill('Choisir un ensemble', 'Reg. NAMO')

    // Select the first layer name in the dropdown menu
    cy.fill('Choisir une thématique', 'Armor CSJ Dragues')

    // layer name should have changed
    cy.get('.Component-SingleTag').contains('Armor CSJ Dragues')

    // select UE law_type should display an empty list
    cy.fill('Choisir un ensemble', '494/2002')
    cy.get('[id="Choisir une thématique"]').click()
    cy.get('[data-testid="picker-popup"] > div').contains('Aucun résultat trouvé')

    /**
     * Region list should be enabled or disabled depending on the law type
     */
    // Select a French law type
    cy.fill('Choisir un ensemble', 'Reg. MED')
    cy.get('[id="Choisir une région"]').parent().click()
    // Region list length should be equal to 18
    cy.get('[id="Choisir une région-listbox"] > div').should('have.length', 18)

    // Select a EU law type
    cy.fill('Choisir un ensemble', '2019')
    // Region select picker should be disabled
    cy.get('[id="Choisir une région"]').forceClick().should('have.attr', 'aria-disabled', 'true')

    /**
     * Select "Grand Est" and "Auvergne-Rhône-Alpes" region and remove it
     */
    // Select a french law type
    cy.fill('Choisir un ensemble', 'Reg. MED')
    cy.fill('Choisir une région', ['Auvergne-Rhône-Alpes', 'Grand Est'])

    // 3 tags exists (1 seafront and 2 regions)
    cy.get('.Component-SingleTag').should('have.length', 3)
    cy.get('.Component-SingleTag').contains('Auvergne-Rhône-Alpes')
    cy.get('.Component-SingleTag').contains('Grand Est')

    // Remove tag
    cy.get('.Component-SingleTag').filter(':contains("Auvergne-Rhône-Alpes")').find('button').click({ force: true })

    // 2 tags still exists (1 seafront and 1 region)
    cy.get('.Component-SingleTag').should('have.length', 2)
  })

  it('Enter a reg text name with a valid url', () => {
    // TODO A re-render might stop the first fill(), we need to re-fill a second time
    cy.fill('Nom', 'zone name', { delay: 20 })
    cy.fill('Nom', 'zone name', { delay: 20 })
    cy.fill('URL', 'http://url.com', { delay: 20 })
    cy.clickButton('Enregistrer')

    cy.get('.Component-SingleTag').contains('zone name')
    cy.get('.Component-SingleTag').find('button').click()
    cy.get('.Component-SingleTag').should('not.exist')

    // Clear reg zone name form
    cy.clickButton('Effacer')
    cy.get('[name="reference"]').invoke('val').should('equal', '')
    cy.get('[name="url"]').invoke('val').should('equal', '')
  })

  it('A modal should be open on go back button click', () => {
    cy.fill('Nom', 'zone name')
    cy.fill('URL', 'http://url.com')
    cy.get('[data-cy="go-back-link"]').eq(0).click({ force: true })
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-text"]').should(
      'have.text',
      'Voulez-vous enregistrer les modifications\napportées à la réglementation ?'
    )

    // Confirm modal is closed on close icon click
    cy.get('[data-cy="confirm-modal-close-icon"]').click()
    cy.get('[data-cy="regulation-modal"]').should('not.exist')

    // Confirm modal is closed on confirm button click and error is displayed
    cy.get('[data-cy="go-back-link"]').eq(0).click({ force: true })
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.get('[data-cy="save-forbidden-btn"]').should('exist')

    // New regulation page is closed and backoffice list is displayed on cancel button click
    cy.get('[data-cy="go-back-link"]').eq(0).click({ force: true })
    cy.get('[data-cy="confirm-modal-cancel-button"]').click()
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.url().should('include', '/backoffice')
  })

  it('Gears regulations', () => {
    /**
     * Check and uncheck of all gears Should add or remove all gears
     */
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
    cy.get('[data-cy="unauthorized-all-gears-option"]').find('input').forceClick()

    // then
    cy.get('[data-cy="unauthorized-all-towed-gears-option"]').should('have.class', 'rs-checkbox-checked')
    cy.get('[data-cy="unauthorized-all-passive-gears-option"]').should('have.class', 'rs-checkbox-checked')
    cy.get('[data-cy^="tag-"]').should('have.length', 12)
    cy.get('[data-cy="unauthorized-all-gears-option"]').find('input').forceClick()

    cy.get('[data-cy="unauthorized-all-towed-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
    cy.get('[data-cy="unauthorized-all-passive-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
    cy.get('[data-cy^="tag-"]').should('have.length', 0)

    /**
     * Check all towed gear displays a list of towed gear categories
     */
    // when
    cy.get('[data-cy="authorized-all-towed-gears-option"] > div > label').click({ force: true })
    // then
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 4)
    cy.get('[data-cy="mesh-label"]').should('have.length', 2)
    // when
    cy.get('[data-cy="close-tag-Sennes traînantes"]').scrollIntoView().click()
    // then
    cy.get('[data-cy="tag-Sennes traînantes"]').should('not.exist')
    cy.get('[data-cy="authorized-all-towed-gears-option"]').should('not.be.checked')

    /**
     * Check all passive gears display a list of passive gear categories
     */
    // when
    cy.get('[data-cy="authorized-all-passive-gears-option"] > div > label').scrollIntoView().click()
    // then
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 9)
    cy.get('[data-cy="mesh-label"]').should('have.length', 4)
    // when
    cy.get('[data-cy="close-tag-Sennes tournantes coulissantes"]').scrollIntoView().click()
    // then
    cy.get('[data-cy="tag-Sennes tournantes coulissantes"]').should('not.exist')
    cy.get('[data-cy="authorized-all-passive-gears-option"]').should('not.have.class', 'rs-checkbox-checked')
  })

  it('Modification of inputs Should be kept in local storage when refreshing the page', () => {
    // Given
    cy.fill('Choisir un ensemble', 'Reg. MEMN')
    cy.fill('Choisir une thématique', 'Ouest Cotentin Bivalves')
    cy.fill('Choisir une région', ['Auvergne-Rhône-Alpes'])
    // TODO A re-render might stop the first fill(), we need to re-fill a second time
    cy.fill('Nom', 'zone name')
    cy.fill('Nom', 'zone name')
    cy.fill('URL', 'http://url.com')
    cy.clickButton('Enregistrer')

    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click()
    cy.get('[data-cy="authorized-all-towed-gears-option"] > div > label').click()
    cy.get('*[data-cy^="open-regulated-species"]').scrollIntoView().click({ force: true }).scrollIntoView()
    cy.get('.rs-picker-toggle-placeholder').filter(':contains("catégories d\'espèces")').eq(0).parent().click()
    cy.wait(200)
    cy.get('.rs-search-box-input').type('Espèce{enter}', { force: true })
    cy.get('.rs-picker-toggle-placeholder').filter(':contains("des espèces")').eq(0).click({ timeout: 10000 })
    cy.wait(200)
    cy.get('.rs-search-box-input').type('HKE{enter}', { force: true })

    // Values are found
    cy.get('.Component-SingleTag').contains('Reg. MEMN')
    cy.get('.Component-SingleTag').contains('Ouest Cotentin Bivalves')
    cy.get('.Component-SingleTag').contains('Auvergne-Rhône-Alpes')
    cy.get('.Component-SingleTag').contains('zone name')
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 4)
    cy.get('[data-cy="mesh-label"]').should('have.length', 2)
    cy.get('[data-cy="tag-MERLU D\'EUROPE (HKE)"]').should('exist')
    cy.get('[data-cy="tag-Espèces eau profonde"]').should('exist')

    // When
    cy.reload()
    cy.wait(200)
    cy.get('[data-cy="regulatory-gears-section"]').scrollIntoView().click({ force: true })
    cy.get('*[data-cy^="open-regulated-species"]').scrollIntoView().click({ force: true })

    // Then
    cy.wait(200)
    cy.get('.Component-SingleTag').contains('Reg. MEMN')
    cy.get('.Component-SingleTag').contains('Ouest Cotentin Bivalves')
    cy.get('.Component-SingleTag').contains('Auvergne-Rhône-Alpes')
    cy.get('[name="reference"]').invoke('val').should('equal', 'zone name')
    cy.get('[data-cy="regulatory-gear-line"]').should('have.length', 4)
    cy.get('[data-cy="mesh-label"]').should('have.length', 2)
    cy.get('[data-cy="tag-MERLU D\'EUROPE (HKE)"]').should('exist')
    cy.get('[data-cy="tag-Espèces eau profonde"]').should('exist')
  })

  it('Should send the expected request when creating a regulation with a complex period', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')

    // Identification de la zone réglementaire
    cy.fill('Choisir un ensemble', 'Reg. MEMN')
    cy.wait(1000)
    cy.fill('Choisir une thématique', 'Ouest Cotentin Bivalves')
    cy.fill('Nom de la zone', 'Une zone REG')
    cy.fill('Choisir une région', ['Auvergne-Rhône-Alpes'])
    cy.fill('Choisir un tracé', '598')

    // Références réglementaires en vigueur
    // TODO A re-render might stop the first fill(), we need to re-fill a second time
    cy.fill('Nom', ' ')
    cy.fill('Nom', 'zone name')
    cy.fill('URL', 'http://url.com')
    cy.fill('Début de validité', [2024, 1, 1])
    cy.fill("jusqu'à nouvel ordre", true)
    cy.get('label:contains("création de la zone")').click()

    // Périodes de pêche
    cy.contains('Périodes de pêche').scrollIntoView().click()
    cy.contains('autorisées').click().scrollIntoView()
    // Récurrence annuelle
    cy.contains('oui').click()

    cy.contains('Plages de dates')
      .parent()
      .parent()
      .find('input')
      .eq(0)
      .click({ force: true })
      .wait(250)
      .type('10102024', { delay: 150, force: true })
    cy.contains('Plages de dates')
      .parent()
      .parent()
      .find('input')
      .eq(1)
      .click({ force: true })
      .wait(250)
      .type('31102024', { delay: 500, force: true })
    cy.contains('Plages de dates').parent().parent().find('a').eq(0).click()
    cy.contains('Plages de dates')
      .parent()
      .parent()
      .find('input')
      .eq(2)
      .click({ force: true })
      .wait(250)
      .type('10122024', { delay: 500, force: true })
    cy.contains('Plages de dates')
      .parent()
      .parent()
      .find('input')
      .eq(3)
      .click({ force: true })
      .wait(250)
      .type('31122024', { delay: 500, force: true })

    cy.get('[data-cy="weekday-lundi"]').click()
    cy.get('[data-cy="weekday-mercredi"]').click()
    cy.get('[data-cy="holidays-checkbox"]').click()

    // When
    cy.get('[data-cy="validate-button"]').click()

    // Then

    cy.wait('@postRegulation').then(({ request, response }) => {
      expect(request.body)
        .contain('<Name>fishing_period</Name>' +
        '<Value>{"dateRanges":[{"endDate":"0002-10-31T00:00:00.000Z","startDate":"0002-10-10T00:00:00.000Z"},' +
        '{"endDate":"0002-12-31T00:00:00.000Z","startDate":"0002-12-10T00:00:00.000Z"}],"dates":[],"timeIntervals":[],' +
        '"weekdays":["lundi","mercredi"],"holidays":true,"authorized":true,"annualRecurrence":true}</Value>')

      expect(response && response.statusCode).equal(200)
    })
  })
})
