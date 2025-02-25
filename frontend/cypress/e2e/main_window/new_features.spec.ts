context('Main Window > New features', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.login('superuser')
    cy.visit(`/`)
    cy.wait(5000)
  })

  it('Should display all new features and decrement the badge number when checked', () => {
    cy.get('[title="Nouveautés MonitorFish"]').parent().contains(3)

    cy.clickButton('Nouveautés MonitorFish')

    cy.getDataCy('map-new-features-box').should('be.visible')
    cy.getDataCy('map-new-features-box').contains('Lorem ipsum dolor sit amet')
    cy.getDataCy('Lorem ipsum dolor sit amet').find('span').eq(0).should('have.css', 'background-color', 'rgb(86, 151, 210)')

    // When
    cy.getDataCy('Lorem ipsum dolor sit amet').click()

    // Then
    cy.get('[title="Nouveautés MonitorFish"]').parent().contains(2)
    cy.getDataCy('Lorem ipsum dolor sit amet').contains('Nouveauté')
    cy.getDataCy('Lorem ipsum dolor sit amet').contains('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.')
    cy.getDataCy('Lorem ipsum dolor sit amet').find('span').eq(0).should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')

    cy.getDataCy('map-new-features-box').contains('Consectetur adipiscing elit')
    cy.getDataCy('map-new-features-box').contains('Incididunt ut labore et dolore')
  })

})
