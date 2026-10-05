const ONE_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

context('Main Window > User Feedback', () => {
  it('A user Should send a feedback to the MonitorFish team', () => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.intercept('POST', '/bff/v1/user_feedback', { statusCode: 500 }).as('sendUserFeedbackWithError')

    cy.get('button[title="Nous contacter"]').click()
    cy.get('[data-cy="map-user-feedback-box"]').contains('Nous contacter')
    cy.contains('button', 'Envoyer').should('be.disabled')

    // When the feedback could not be sent
    cy.get('textarea[name="user-feedback-message"]').type('Le filtre des navires ne fonctionne pas')
    cy.contains('button', 'Envoyer').click()

    cy.wait('@sendUserFeedbackWithError')
    cy.get('[data-cy="map-user-feedback-box"]').contains("Nous n'avons pas pu envoyer votre message.")
    cy.get('textarea[name="user-feedback-message"]').should('have.value', 'Le filtre des navires ne fonctionne pas')

    // When the feedback is sent with a screenshot
    cy.get('[data-cy="map-user-feedback-box"] input[type=file]').selectFile(
      {
        contents: Cypress.Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64'),
        fileName: 'capture.png',
        mimeType: 'image/png'
      },
      { force: true }
    )
    cy.get('[data-cy="map-user-feedback-box"] img').should('have.length', 1)

    cy.intercept('POST', '/bff/v1/user_feedback', { statusCode: 201 }).as('sendUserFeedback')
    cy.contains('button', 'Envoyer').click()

    cy.wait('@sendUserFeedback').then(({ request }) => {
      expect(request.body.message).to.equal('Le filtre des navires ne fonctionne pas')
      expect(request.body.pageUrl).to.contain('/#@')
      expect(request.body.files).to.have.length(1)
      expect(request.body.files[0].name).to.equal('capture.png')
      expect(request.body.files[0].mimeType).to.equal('image/png')
      expect(request.body.files[0].content).to.not.be.empty
    })
    cy.get('[data-cy="map-user-feedback-box"]').contains('Merci, nous prendrons connaissance de votre message.')

    cy.get('button[title="Nous contacter"]').click()
    cy.get('[data-cy="map-user-feedback-box"]').should('not.exist')
  })
})
