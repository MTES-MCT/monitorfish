import { getLocalizedDayjs, getUtcizedDayjs } from '@mtes-mct/monitor-ui'

context('Vessels Track', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Last position card with Alert Should be seen on the map on pointer move', () => {
    // When we move the pointer cursor (from one point to another to emit an event)
    // We do not need to subtract 50 to Y because we use clientY property, which set the coordinates from the whole window
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 480, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 305, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 307, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 300, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 307, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 305, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 305, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 307, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 300, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 905, clientY: 307, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 904, clientY: 305, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
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
    // We do not need to subtract 50 to Y because we use clientY property, which set the coordinates from the whole window
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 460, clientY: 480, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 980, clientY: 785, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 981, clientY: 787, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 780, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 982, clientY: 787, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 980, clientY: 785, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 979, clientY: 785, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 985, clientY: 787, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 985, clientY: 787, force: true, pointerId: 1 })
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 984, clientY: 785, force: true, pointerId: 1 })

    // Then
    cy.wait(50)
    cy.get('*[data-cy^="vessel-card-name"]').contains('FRAIS AVIS MODE')
    cy.get('*[data-cy^="vessel-card-beacon-malfunction"]').contains('NON-ÉMISSION VMS')
  })

  it('Position card Should be seen on the map on vessel track pointer move', () => {
    // When we click on the vessel
    cy.wait(200)
    // We must subtract 50 to Y (the real vessel coordinates is 480 + 50 = 530) as the application <Warning/> component offset the .vessels div
    cy.get('.VESSELS_POINTS').click(460, 480, { force: true, timeout: 10000 })

    // When we move the pointer cursor to a track point (from one point to another to emit an event)
    // We do not need to subtract 50 to Y because we use clientY property, which set the coordinates from the whole window
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 910, clientY: 300, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 627, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 626, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 627, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 628, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 629, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 625, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 627, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 628, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 629, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 625, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 627, force: true, pointerId: 1 })
    cy.wait(20)
    cy.get('.VESSELS_POINTS').trigger('pointermove', { clientX: 425, clientY: 628, force: true, pointerId: 1 })

    cy.wait(50)
    cy.get('*[data-cy^="vessel-track-card-latitude"]').contains('47° 38′ 24″ N')
    cy.get('*[data-cy^="vessel-track-card-longitude"]').contains('008° 07′ 01″ W')
    cy.get('*[data-cy^="vessel-track-card-course"]').contains('17°')
    cy.get('*[data-cy^="vessel-track-card-speed"]').contains('8.6')
  })

  it('A track Should be showed When clicking on a vessel with CTRL key pressed', () => {
    // When
    cy.wait(200)
    // We must subtract 50 to Y (the real vessel coordinates is 480 + 50 = 530) as the application <Warning/> component offset the .vessels div
    cy.get('.VESSELS_POINTS').click(460, 480, { ctrlKey: true, force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('.VESSELS_POINTS').click(504, 289, { ctrlKey: true, force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('.VESSELS_POINTS').click(295, 297, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
    cy.wait(200)

    cy.log('Show only the selected vessels')
    cy.get('*[data-cy^="trigger-hide-other-vessels-from-sidebar"]').click({ force: true, timeout: 10000 })
    cy.wait(200)

    cy.get('body').type('-', { force: true }) // Because of the throttle, we de-zoom to show labels
    cy.wait(200)
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 3)
    cy.wait(200)

    cy.log('Close the sidebar')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 10000 }).click()
    cy.get('*[data-cy^="vessel-search-selected-vessel-title"]', { timeout: 10000 }).should('not.exist')

    cy.log('Close one track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(1).click({ force: true })
    cy.get('body').type('+', { force: true }) // Because of the throttle, we zoom to refresh labels
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.log('Hide other vessels')
    cy.get('*[data-cy^="vessel-visibility"]').click()
    cy.get('*[data-cy^="map-property-trigger"]')
      .filter(':contains("les navires non sélectionnés")')
      .eq(1)
      .click({ force: true, timeout: 10000 })
    cy.wait(200)
    cy.get('body').type('-', { force: true }) // Because of the throttle, we de-zoom to refresh labels
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 1)

    cy.log('Close the last track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })

  it('A track Should be showed When clicking on a vessel with the custom map menu', () => {
    cy.log('Show a first vessel with a three day track depth')
    cy.wait(200)
    // We must subtract 50 to Y (the real vessel coordinates is 480 + 50 = 530) as the application <Warning/> component offset the .vessels div
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-three-days"]').click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.log('Show a second vessel with a custom date range')
    cy.get('.VESSELS_POINTS').rightclick(504, 289, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-custom-period"]').click({ force: true })
    cy.get('.rs-picker-daterange > .rs-btn').eq(0).click(460, 480, { force: true, timeout: 10000 })

    cy.get('.rs-calendar-table-cell:not(.rs-calendar-table-cell-un-same-month) .rs-calendar-table-cell-day')
      .contains(new RegExp(`^${getLocalizedDayjs(getUtcizedDayjs().toDate()).format('D')}$`))
      .click({ force: true, timeout: 10000 })
    cy.get('.rs-calendar-table-cell:not(.rs-calendar-table-cell-un-same-month) .rs-calendar-table-cell-day')
      .contains(new RegExp(`^${getLocalizedDayjs(getUtcizedDayjs().toDate()).format('D')}$`))
      .click({ force: true, timeout: 10000 })
    cy.get('.rs-picker-toolbar-right > .rs-btn').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
  })
})
