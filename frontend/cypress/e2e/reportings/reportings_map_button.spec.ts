import dayjs from "dayjs";

context('Reportings Map Button', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.intercept('GET', '/bff/v1/reportings/display*').as('displayReportings')
    cy.visit('/#@-5690859.51,828199.11,8.28')
    cy.wait('@displayReportings')
    cy.wait(500)
  })

  it('Reporting layer should be opened, hidden and shown', () => {
    cy.get('.REPORTING').should('exist')

    // Dialog should not exist initially
    cy.get('*[data-cy="reporting-map-menu-box"]').should('not.exist')

    // Open the dialog
    cy.clickButton('Signalements')
    cy.get('*[data-cy="reporting-map-menu-box"]').should('be.visible')

    // Hide the reporting layer
    cy.clickButton('Masquer les signalements')
    cy.clickButton('Afficher les signalements')

    cy.fill('Statut', 'Archivé')
    cy.fill('Type', 'Infraction (suspicion)')
    cy.fill('INN / non INN', 'Signalement INN')
    cy.fill('Période', 'Période spécifique')
    const startDateAsDayjs = dayjs().subtract(1, 'year').hour(1).minute(2)
    const endDateAsDayjs = dayjs().hour(3).minute(4)
    cy.get('input[aria-label="Jour de début"]').type(startDateAsDayjs.format('DD'))
    cy.get('input[aria-label="Mois de début"]').type(startDateAsDayjs.format('MM'))
    cy.get('input[aria-label="Année de début"]').type(startDateAsDayjs.format('YYYY'))
    cy.get('input[aria-label="Jour de fin"]').type(endDateAsDayjs.format('DD'))
    cy.get('input[aria-label="Mois de fin"]').type(endDateAsDayjs.format('MM'))
    cy.get('input[aria-label="Année de fin"]').type(endDateAsDayjs.format('YYYY'))
  })
})
