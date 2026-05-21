import { getLocalizedDayjs } from '../utils/getLocalizedDayjs'
import { getUtcizedDayjs } from '../utils/getUtcizedDayjs'

context('Vessels Track', () => {
  it('A track Should be showed When clicking on a vessel with CTRL key pressed', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(5000)

    // When
    cy.wait(400)
    cy.get('.VESSELS_POINTS').click(460, 480, { ctrlKey: true, force: true, timeout: 10000 })
    cy.wait(400)
    cy.get('.VESSELS_POINTS').click(504, 290, { ctrlKey: true, force: true, timeout: 10000 })
    cy.wait(400)
    cy.get('.VESSELS_POINTS').click(295, 300, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
    cy.wait(400)

    cy.log('Show only the selected vessels')
    cy.get('*[data-cy^="trigger-hide-other-vessels-from-sidebar"]').click({ timeout: 10000 })
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

    cy.get('body').type('-', { force: true }) // Because of the throttle, we de-zoom to refresh labels
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 1)

    cy.log('Close the last track')
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })

  it('AIS vessel tracks Should be shown and hidden individually When clicking on AIS vessels', () => {
    cy.login('superuser')
    cy.visit('/#@-1849025.62,4982527.30,8.81')
    cy.wait(5000)

    cy.intercept('GET', '/bff/v1/vessels/ais*').as('aisVessels')
    cy.clickButton('AIS')
    cy.wait('@aisVessels')
    cy.wait(1000)

    // Select BELLE ETOILE
    cy.intercept('GET', '/bff/v1/vessels/ais/positions*').as('belleEtoilePositions')
    cy.hoverOrClickVesselByName('BELLE ETOILE', 'AIS_VESSELS_POINTS', 'click')
    cy.wait('@belleEtoilePositions')
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    // Select VIENTO DEL MAR alongside BELLE ETOILE
    cy.intercept('GET', '/bff/v1/vessels/ais/positions*').as('vientoDelMarPositions')
    cy.hoverOrClickVesselByName('VIENTO DEL MAR', 'AIS_VESSELS_POINTS', 'click')
    cy.wait('@vientoDelMarPositions')
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)

    // Deselect first track
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    // Deselect last track
    cy.get('*[data-cy^="close-vessel-track"]').eq(0).click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })

  it('A track Should be showed When clicking on a vessel with the custom map menu', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(5000)

    cy.log('Show a first vessel with a three day track depth')
    cy.wait(200)
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-three-days"]').click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 1)

    cy.log('Show a second vessel with a custom date range')
    cy.get('.VESSELS_POINTS').rightclick(504, 290, { force: true, timeout: 10000 })
    cy.get('*[data-cy^="show-vessel-tracks-menu-options"]').click({ force: true })
    cy.get('*[data-cy^="show-vessel-tracks-custom-period"]').click({ force: true })
    cy.get('.rs-picker-daterange .rs-picker-caret-icon').eq(0).click(460, 480, { force: true, timeout: 10000 })

    const asDayjsUtcDate = getLocalizedDayjs(getUtcizedDayjs().toDate())
    const today = [asDayjsUtcDate.year(), asDayjsUtcDate.month() + 1, asDayjsUtcDate.date()]
    cy.fill('Période précise', [today, today])
    cy.get('*[data-cy^="close-vessel-track"]').should('have.length', 2)
  })
})
