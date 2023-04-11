/* eslint-disable no-undef */
import { getDate } from '../../../src/utils'

context('Update Regulation', () => {
  beforeEach(() => {
    cy.visit('/backoffice/regulation')
    cy.clearLocalStorage(/persist/)

    // Open a regulation to edit
    cy.get('[data-cy="law-type"]').should('have.length', 3)
    cy.get('[data-cy="law-type"]').eq(0).click()
    cy.get('[data-cy="regulatory-layer-topic-row"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-topic-row"]').eq(0).click({ force: true })
    cy.get('[data-cy="regulatory-layer-zone"]').should('have.length', 1)
    cy.get('[data-cy="regulatory-layer-zone"]').eq(0).trigger('mouseover', { force: true })
    cy.get('[data-cy="regulatory-layer-zone-edit"]').should('have.length', 1).click({ force: true })
    cy.url().should('include', '/regulation/edit')
    cy.wait(500)
  })

  it('A layer zone Should be edited', () => {
    // When check expected form values
    cy.get('[data-cy^="tag"]').should('have.length', 10)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-Ouest Cotentin Bivalves"]').should('exist')
    cy.get('[data-cy="tag-Normandie"]').should('exist')
    cy.get('[data-cy="tag-Bretagne"]').should('exist')
    cy.get('[data-cy="tag-598"]').should('exist')
    cy.get('[data-cy="tag-texte de reference"]').should('exist')
    cy.get('[data-cy="tag-OURSINS NCA (URC)"]').should('exist')
    cy.get('[data-cy="tag-OURSINS,ETC. NCA (URX)"]').should('exist')
    cy.get('[data-cy="tag-Dragues"]').should('exist')
    cy.get('[data-cy="input-Praires Ouest cotentin"]').should('exist')
    cy.get('.rs-picker-toggle-value').eq(0).should('have.text', getDate(new Date().toISOString()))
    cy.get('[data-cy="regulatory-general-other-info"]').contains('Encore une info importante')

    // Then try to save
    cy.get('[data-cy="validate-button"]').contains('Enregister les modifications')
    cy.get('[data-cy="validate-button"]').click()
    cy.get('.rs-checkbox-wrapper').should('have.css', 'border-top-color', 'rgb(225, 0, 15)')
  })

  it('Select another law type should reset selected layer name', () => {
    cy.get('.rs-btn.rs-btn-default.rs-picker-toggle').eq(0).click()
    // Since this input is virtualized, we need to scroll and wait for it to render new items
    cy.get('.rs-picker-select-menu-items > div > div').eq(0).scrollTo(0, 500).wait(500)
    cy.get('[data-key="R(CE) 494/2002"]').eq(0).click()
    cy.get('[data-cy="tag-Ouest Cotentin Bivalves"]').should('not.exist')
  })

  it('A species Should be removed', () => {
    // Given
    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })
    cy.get('[data-cy="authorized-species-selector"]')
      .filter(':contains("des espèces")')
      .scrollIntoView()
      .click({ timeout: 10000 })
      .type('{esc}')

    // When
    cy.get('[data-cy="close-tag-OURSINS NCA (URC)"]').click()

    // Then
    cy.get('[data-cy="tag-OURSINS NCA (URC)"]').should('not.exist')
  })

  it('Save regulation Should send the update payload to Geoserver and go back to backoffice page', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    // complete missing values in form
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })

    // When save form
    cy.get('[data-cy="regulatory-general-other-info"]').scrollIntoView().type(' et une information générale')
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)

    // Then
    cy.wait('@postRegulation').then(({ request, response }) => {
      expect(request.body).contain('typeName="monitorfish:regulations_write"')
      expect(request.body).contain('<Value>Reg. MEMN</Value>')
      expect(request.body).contain('<Value>Praires Ouest cotentin</Value>')
      expect(request.body).contain('<Value>Normandie, Bretagne</Value>')
      expect(request.body).contain(
        '<Name>other_info</Name><Value>Encore une info importante et une information générale</Value>'
      )
      expect(request.body).contain('"reference":"texte de reference"')
      expect(request.body).contain(
        '"url":"http://legipeche.metier.i2/arrete-prefectoral-168-2020-modifie-delib-2020-pr-a10301.html?id_rub=634"'
      )
      expect(request.body).not.equal('"startDate":""')
      expect(request.body).contain('"endDate":"infinite"')
      expect(request.body).contain('"textType":["creation"]')
      expect(request.body).contain('<FeatureId fid="regulations_write.598"/>')
      expect(response && response.statusCode).equal(200)
    })
    cy.url().should('include', '/backoffice')
  })

  it('Save regulation Should send the species regulation updates object to Geoserver', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    // complete missing values in form
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })
    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })
    cy.scrollTo(0, 500)

    cy.log('Select authorized species and groups')
    cy.get('.rs-picker-toggle-placeholder')
      .filter(':contains("catégories d\'espèces")')
      .eq(0)
      .scrollIntoView()
      .click({ timeout: 10000 })
    cy.get('.rs-picker-search-bar-input').type('Espèce{enter}')
    cy.get('[data-cy="authorized-species-selector"]').filter(':contains("des espèces")').click({ timeout: 10000 })
    cy.wait(200)
    cy.get('.rs-picker-search-bar-input').type('HKE{enter}')
    cy.get('*[data-cy^="authorized-regulatory-species-remarks"]').eq(0).type('Ne pas en prendre beaucoup please')

    cy.log('Select unauthorized species and groups')
    cy.get('.rs-picker-toggle-placeholder')
      .filter(':contains("catégories d\'espèces")')
      .eq(1)
      .scrollIntoView()
      .click({ timeout: 10000 })
    cy.get('.rs-picker-search-bar-input').should('have.length', 1)
    cy.get('.rs-picker-search-bar-input').type('Bival{enter}')
    cy.get('[data-cy="unauthorized-species-selector"]').filter(':contains("des espèces")').click({ timeout: 10000 })
    cy.get('.rs-picker-search-bar-input').should('have.length', 1)
    cy.get('.rs-picker-search-bar-input').type('MGE{enter}')

    cy.get('*[data-cy^="regulatory-species-other-info"]').type("Mhm pas d'autre info !")

    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })

    // When
    cy.wait(50)
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)

    // Then
    cy.wait('@postRegulation').then(({ request, response }) => {
      expect(request.body)
        // Unauthorized
        .contain(
          '{"unauthorized":{"species":[{"code":"MGE","name":"MICROGLANIS ATER"}],"speciesGroups":["Bivalves"]},' +
            // Authorized
            '"authorized":{"species":[{"code":"URC","remarks":"- Pas plus de 500kg\\n - ' +
            'Autre remarqueNe pas en prendre beaucoup please","name":"OURSINS NCA"},' +
            '{"code":"URX","remarks":"500 kg","name":"OURSINS,ETC. NCA"},' +
            '{"code":"HKE","name":"MERLU D\'EUROPE"}],"speciesGroups":["Espèces eau profonde"]},' +
            '"otherInfo":"Mhm pas d\'autre info !"}'
        )

      expect(response && response.statusCode).equal(200)
    })
    cy.url().should('include', '/backoffice')
  })

  it('Save regulation Should send the gears regulation updates object to Geoserver', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    // complete missing values in form
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })
    cy.get('*[data-cy^="open-regulated-species"]').click({ force: true })
    cy.scrollTo(0, 500)
    cy.get('*[data-cy^="regulatory-gears-section"]').click({ force: true })
    cy.get('*[data-cy="authorized-gears-selector"]').scrollIntoView()

    cy.log('Select OT - Chaluts à panneaux')
    cy.get('[data-cy="authorized-gears-selector"]').click({ timeout: 10000 })
    cy.get('.rs-checkbox-checker').filter(':contains("Chaluts")').click({ timeout: 10000 })
    cy.get('.rs-checkbox-checker').filter(':contains("OT - Chaluts à panneaux")').click({ timeout: 10000 })
    cy.get('[data-cy="authorized-gears-selector"]').filter(':contains("des engins")').type('{esc}')

    cy.log('Unselect OT - Chaluts à panneaux')
    cy.get('[data-cy="authorized-gears-selector"]').filter(':contains("des engins")').click({ timeout: 10000 })
    cy.get('.rs-checkbox-checker').filter(':contains("Chaluts")').eq(0).click({ timeout: 10000 })
    cy.get('.rs-checkbox-checker').filter(':contains("OT - Chaluts à panneaux")').click({ timeout: 10000 })
    cy.get('[data-cy="authorized-gears-selector"]').filter(':contains("des engins")').type('{esc}')

    cy.log('Modify to lowerThanOrEqualTo')
    cy.get('.rs-picker-select').filter(':contains("inférieur à")').click({ timeout: 10000 })
    cy.get('.rs-picker-select-menu-item').eq(3).click({ timeout: 10000 })

    cy.log('Add unauthorized gear')
    cy.get('[data-cy="unauthorized-gears-selector"]').filter(':contains("des engins")').click({ timeout: 10000 })
    cy.get('.rs-checkbox-checker').filter(':contains("Chaluts")').eq(0).click({ timeout: 10000 })
    cy.get('.rs-checkbox-checker').filter(':contains("OT - Chaluts à panneaux")').click({ timeout: 10000 })
    cy.get('[data-cy="unauthorized-gears-selector"]').filter(':contains("des engins")').type('{esc}')

    // When
    cy.wait(50)
    cy.get('[data-cy="validate-button"]').click()
    cy.wait(200)

    // Then
    cy.wait('@postRegulation').then(({ request, response }) => {
      expect(request.body).contain(
        // Unauthorized
        '{"unauthorized":{"allGears":false,"otherInfo":null,"allTowedGears":false,' +
          '"regulatedGears":{"OT":{"code":"OT","name":"Chaluts à panneaux (non spécifiés)","category":"Chaluts","groupId":1}},' +
          '"allPassiveGears":false,"regulatedGearCategories":{},"selectedCategoriesAndGears":["OT"]},' +
          // Authorized
          '"authorized":{"allGears":false,"otherInfo":"- Drague sans dent et de largeur maximale 1,30 mètre\\n - Dragues avec dents !",' +
          '"allTowedGears":false,"regulatedGears":{"TBN":{"code":"TBN","name":"Chaluts à langoustines",' +
          '"category":"Chaluts","groupId":1,"meshType":"lowerThanOrEqualTo","mesh":["123"],"remarks":"Attention à cette espèce!"}},' +
          '"allPassiveGears":false,"regulatedGearCategories":{"Dragues":{"name":"Dragues"}},"selectedCategoriesAndGears":["Dragues","TBN"]}}'
      )

      expect(response && response.statusCode).equal(200)
    })
    cy.url().should('include', '/backoffice')
  })

  it('Confirm modal is closed on confirm button click and post request is sent', () => {
    // Given
    cy.intercept('POST', '/geoserver/wfs', { hostname: 'localhost' }).as('postRegulation')
    cy.get('[type="checkbox"]').first().check({ force: true })
    cy.get('[type="checkbox"]').eq(2).check({ force: true })

    // When
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()

    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.wait('@postRegulation').then(({ response }) => {
      expect(response && response.statusCode).equal(200)
    })
    cy.url().should('include', '/backoffice')
  })

  it('If a value is missing, the confirm modal is opened and a warning message is displayed if saving', () => {
    // When
    cy.get('[data-cy="close-tag-Ouest Cotentin Bivalves"]').click()
    cy.get('[data-cy="go-back-link"]').eq(0).click()
    cy.get('[data-cy="regulation-modal"]').should('exist')
    cy.get('[data-cy="confirm-modal-confirm-button"]').click()

    // Then
    cy.get('[data-cy="save-forbidden-btn"]').should('exist')
  })

  it('A modal should not be opened on go back button click, if nothing has been modified', () => {
    // When
    cy.wait(2000)
    cy.get('[data-cy="go-back-link"]').eq(0).click()

    // Then
    cy.get('[data-cy="regulation-modal"]').should('not.exist')
    cy.url().should('include', '/backoffice')
  })

  it('Form values should be kept when F5 is pressed', () => {
    cy.wait(200)
    // When F5 is pressed
    cy.reload()
    // then form values are kept
    cy.get('[data-cy^="tag"]').should('have.length', 10)
    cy.get('[data-cy="tag-Reg. MEMN"]').should('exist')
    cy.get('[data-cy="tag-Ouest Cotentin Bivalves"]').should('exist')
    cy.get('[data-cy="tag-Normandie"]').should('exist')
    cy.get('[data-cy="tag-Bretagne"]').should('exist')
    cy.get('[data-cy="tag-598"]').should('exist')
    cy.get('[data-cy="tag-texte de reference"]').should('exist')
    cy.get('[data-cy="input-Praires Ouest cotentin"]').should('exist')
    cy.get('.rs-picker-toggle-value').eq(0).should('have.text', getDate(new Date().toISOString()))
  })
})
