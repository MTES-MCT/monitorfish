/// <reference types="cypress" />

import dayjs from 'dayjs'

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessels Track', () => {
  beforeEach(() => {
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Last position card with Alert Should be seen on the map on pointer move', () => {
    // When we move the pointer cursor (from one point to another to emit an event)
    cy.get('.vessels').trigger('pointermove', { clientX: 460, clientY: 480, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 904, clientY: 305, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 905, clientY: 307, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 910, clientY: 300, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 905, clientY: 307, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 904, clientY: 305, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 904, clientY: 305, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 905, clientY: 307, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 910, clientY: 300, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 905, clientY: 307, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 904, clientY: 305, pointerId: 1, force: true })

    // Then
    cy.get('*[data-cy^="vessel-card-name"]').contains('EN RÉPÉTER PÈRE')
    cy.get('*[data-cy^="vessel-card-latitude"]').contains('48° 26′ 17″ N')
    cy.get('*[data-cy^="vessel-card-longitude"]').contains('006° 30′ 22″ W')
    cy.get('*[data-cy^="vessel-card-internal-reference-number"]').contains('ABC000904657')
    cy.get('*[data-cy^="vessel-card-external-reference-number"]').contains('OZ854230')
    cy.get('*[data-cy^="vessel-card-mmsi"]').contains('048713984')
    cy.get('*[data-cy^="vessel-card-ircs"]').contains('AQIK')
    cy.get('*[data-cy^="vessel-card-alert"]').contains('3 milles - Chaluts')
  })

  it('Last position card with Beacon malfunction Should be seen on the map on pointer move', () => {
    // When we move the pointer cursor (from one point to another to emit an event)
    cy.get('.vessels').trigger('pointermove', { clientX: 460, clientY: 480, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 980, clientY: 785, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 981, clientY: 787, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 910, clientY: 780, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 982, clientY: 787, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 980, clientY: 785, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 979, clientY: 785, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 985, clientY: 787, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 985, clientY: 787, pointerId: 1, force: true })
    cy.get('.vessels').trigger('pointermove', { clientX: 984, clientY: 785, pointerId: 1, force: true })

    // Then
    cy.get('*[data-cy^="vessel-card-name"]').contains('FRAIS AVIS MODE')
    cy.get('*[data-cy^="vessel-card-beacon-malfunction"]').contains('NON-ÉMISSION VMS')
  })

  it('Position card Should be seen on the map on vessel track pointer move', () => {
    // When we click on the vessel
    cy.wait(200)
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })

    // When we move the pointer cursor to a track point (from one point to another to emit an event)
    cy.get('.vessels').trigger('pointermove', { clientX: 910, clientY: 300, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 687, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 686, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 687, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 688, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 689, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 685, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 687, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 688, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 689, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 685, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 687, pointerId: 1, force: true })
    cy.wait(20)
    cy.get('.vessels').trigger('pointermove', { clientX: 411, clientY: 688, pointerId: 1, force: true })

    cy.get('*[data-cy^="vessel-track-card-latitude"]').contains('47° 38′ 24″ N')
    cy.get('*[data-cy^="vessel-track-card-longitude"]').contains('008° 07′ 01″ W')
    cy.get('*[data-cy^="vessel-track-card-course"]').contains('17°')
    cy.get('*[data-cy^="vessel-track-card-speed"]').contains('8.6')
  })

  it('A track Should be showed When clicking on a vessel with CTRL key pressed', () => {
    // When
    cy.wait(200)
    cy.get('.vessels').click(460, 480, { timeout: 20000, ctrlKey: true, force: true })
    cy.wait(200)
    cy.get('.vessels').click(504, 289, { timeout: 20000, ctrlKey: true, force: true })
    cy.wait(200)
    cy.get('.vessels').click(295, 297, { timeout: 20000, force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
    cy.wait(200)

    cy.log('Show only the selected vessels')
    cy.get('*[data-cy^="trigger-hide-other-vessels-from-sidebar"]').click({ timeout: 20000, force: true })
    cy.wait(200)

    cy.focused()
      .type('-', { force: true }) // Because of the throttle
    cy.wait(200)
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 3)
    cy.wait(200)

    cy.log('Close the sidebar')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 20000 }).should('not.exist')

    cy.log('Close one track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(1).click({ force: true })
    cy.wait(1000) // Because of the throttle
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.log('Hide other vessels')
    cy.get('*[data-cy^="open-vessels-visibility"]').click()
    cy.get('*[data-cy^="map-property-trigger"]')
      .filter(':contains("les navires non sélectionnés")')
      .eq(1)
      .click({ timeout: 20000, force: true })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 2)

    cy.log('Close the last track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })

  it('A track Should be showed When clicking on a vessel with the custom map menu', () => {
    cy.log('Show a first vessel with a three day track depth')
    cy.wait(200)
    cy.get('.vessels').rightclick(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-three-days"]').click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.log('Show a second vessel with a custom date range')
    cy.get('.vessels').rightclick(504, 289, { timeout: 20000, force: true })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-custom-period"]').click({ force: true })
    cy.get('.rs-picker-daterange > .rs-btn').eq(0).click(460, 480, { timeout: 20000, force: true })

    cy.get('.rs-calendar-table-cell-day').contains(dayjs().subtract(1, 'day').format('D')).click({ timeout: 20000, force: true })
    cy.get('.rs-calendar-table-cell-day').contains(dayjs().format('D')).click({ timeout: 20000, force: true })
    cy.get('.rs-picker-toolbar-right > .rs-btn').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
  })
})
