import { openSideWindowPriorNotificationList } from './utils'
import { customDayjs } from '../../utils/customDayjs'

context('Side Window > Prior Notification List > Filter Bar', () => {
  const basePath = '/bff/v1/prior-notifications?'

  beforeEach(() => {
    openSideWindowPriorNotificationList()
  })

  it('Should filter prior notifications by countries', () => {
    cy.intercept('GET', `${basePath}*flagStates=FRA&flagStates=ESP*`).as('getPriorNotifications')

    cy.fill('Nationalité', ['Espagne', 'France'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by fleet segments', () => {
    cy.intercept('GET', `${basePath}*tripSegmentSegments=NWW03&tripSegmentSegments=SWW06*`).as('getPriorNotifications')

    cy.fill('Segments de flotte', ['NWW03', 'SWW06'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by species', () => {
    cy.intercept('GET', `${basePath}*specyCodes=FRF&specyCodes=HKE*`).as('getPriorNotifications')

    cy.fill('Espèces à bord', ['FRF', 'HKE'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by gears', () => {
    cy.intercept('GET', `${basePath}*tripGearCodes=OTT&tripGearCodes=TBS*`).as('getPriorNotifications')

    cy.get('#gearCodes').click()
    cy.get('[role="searchbox"]').type('OTT')
    cy.get('.rs-picker-cascader-search-match').click()
    cy.get('[role="searchbox"]').clear().type('TBS')
    cy.get('.rs-picker-cascader-search-match').click()
    cy.get('body').type('{esc}')

    // TODO Fix that in monitor-ui.
    // cy.fill('Engins utilisés', ['OTT', 'TBS'])

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by last control date', () => {
    const expectedPartialBeforeDate = customDayjs().subtract(3, 'months').toISOString().substring(0, 10)
    cy.intercept('GET', `${basePath}*lastControlledBefore=${expectedPartialBeforeDate}*`).as('getPriorNotifications')

    cy.fill('Date du dernier contrôle', 'Contrôlé il y a plus de 3 mois')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

    const expectedPartialAfterDate = customDayjs().subtract(1, 'month').toISOString().substring(0, 10)
    cy.intercept('GET', `${basePath}*lastControlledAfter=${expectedPartialAfterDate}*`).as('getPriorNotifications')

    cy.fill('Date du dernier contrôle', 'Contrôlé il y a moins d’1 mois')

    cy.wait('@getPriorNotifications')

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  // it('Should filter prior notifications by arrival date', () => {
  //   const expectedPartialDefaultAfterDate = customDayjs().add(3, 'months').toISOString().substring(0, 10)
  //   cy.intercept('GET', `${basePath}*willArriveAfter=${expectedPartialDefaultAfterDate}*`).as('getPriorNotifications')

  //   cy.wait('@getPriorNotifications')

  //   cy.intercept('GET', `${basePath}*willArriveAfter=${expectedPartialBeforeDate}*`).as('getPriorNotifications')

  //   cy.fill('Date d’arrivée estimée', 'Arrivée estimée dans moins de 24h')

  //   cy.wait('@getPriorNotifications')

  //   cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)

  //   const expectedPartialAfterDate = customDayjs().subtract(1, 'month').toISOString().substring(0, 10)
  //   cy.intercept('GET', `${basePath}*lastControlledAfter=${expectedPartialAfterDate}*`).as('getPriorNotifications')

  //   cy.fill('Date d’arrivée estimée', 'Contrôlé il y a moins d’1 mois')

  //   cy.wait('@getPriorNotifications')

  //   cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  // })

  it('Should filter prior notifications by ports', () => {
    cy.intercept('GET', `${basePath}*&tripSegmentSegments=NWW03*`).as('getPriorNotifications')

    cy.get('#portLocodes').click()
    cy.get('[role="searchbox"]').type('Saint-Malo')
    cy.get('.rs-picker-cascader-search-match').click()
    cy.get('[role="searchbox"]').clear().type('Vannes')
    cy.get('.rs-picker-cascader-search-match').click()
    cy.get('body').type('{esc}')

    // TODO Fix that in monitor-ui.
    // cy.fill('Ports d’arrivée', ['FRSML', 'FRVNE'])

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })

  it('Should filter prior notifications by type', () => {
    cy.intercept('GET', `${basePath}*priorNotificationTypes=Préavis type A&priorNotificationTypes=Préavis type C*`).as(
      'getPriorNotifications'
    )

    cy.fill('Types de préavis', ['Préavis type A', 'Préavis type C'])

    cy.get('.Table-SimpleTable tr').should('have.length.to.be.greaterThan', 0)
  })
})
