context('Main Window > User Feedback', () => {
  it('A user Should send a feedback to the MonitorFish team', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.intercept('POST', '/bff/v1/user_feedback', { statusCode: 201 }).as('sendUserFeedback')

    cy.get('button[title="Nous contacter"]').click()
    cy.get('[data-cy="map-user-feedback-box"]').contains('Nous contacter')
    cy.contains('button', 'Envoyer').should('be.disabled')

    cy.get('textarea[name="user-feedback-message"]').type('Le filtre des navires ne fonctionne pas')
    cy.contains('button', 'Envoyer').click()

    cy.wait('@sendUserFeedback').then(({ request }) => {
      expect(request.body.message).to.equal('Le filtre des navires ne fonctionne pas')
      expect(request.body.pageUrl).to.contain('/#@')
    })
    cy.get('[data-cy="map-user-feedback-box"]').contains('Merci, nous prendrons connaissance de votre message.')

    cy.get('button[title="Nous contacter"]').click()
    cy.get('[data-cy="map-user-feedback-box"]').should('not.exist')
  })

  it('A user Should see an error When the feedback could not be sent', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.intercept('POST', '/bff/v1/user_feedback', { statusCode: 500 }).as('sendUserFeedback')

    cy.get('button[title="Nous contacter"]').click()
    cy.get('textarea[name="user-feedback-message"]').type('Bonjour')
    cy.contains('button', 'Envoyer').click()

    cy.wait('@sendUserFeedback')
    cy.get('[data-cy="map-user-feedback-box"]').contains("Nous n'avons pas pu envoyer votre message.")
    cy.get('textarea[name="user-feedback-message"]').should('have.value', 'Bonjour')
  })
})
