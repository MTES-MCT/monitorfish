import {getLocalizedDayjs} from '../utils/getLocalizedDayjs'
import {getUtcizedDayjs} from '../utils/getUtcizedDayjs'

context('Vessels Track', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(5000)
  })

  it('A track Should be showed When clicking on a vessel with CTRL key pressed', () => {
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

  it('A track Should be showed When clicking on a vessel with the custom map menu', () => {
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
