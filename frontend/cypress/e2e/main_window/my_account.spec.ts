context('Main Window > My Account', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.login('superuser')
    cy.visit(`/`, {
      onBeforeLoad(window) {
        Object.defineProperty(window.navigator, 'serviceWorker', {
          value: {
            addEventListener: () => {},
            getRegistration: () =>
              Promise.resolve({
                update: () => {}
              }),
            getRegistrations: () => Promise.resolve([]),
            register: () =>
              Promise.resolve({
                addEventListener: () => {}
              })
          }
        })
      }
    })
    cy.wait(5000)
  })

  it('Should enable base map caching When service worker is mocked', () => {
    cy.get('[title="Nouveautés MonitorFish"]').parent().contains(3)

    cy.clickButton('Mon compte', { withoutScroll: true })

    cy.get('*[data-cy="map-property-trigger"]').filter(':contains("les cartes en local")').click()

    cy.contains("Êtes-vous sûr d'activer le téléchargement des cartes en local ?").should('be.visible')

    cy.clickButton('Activer et recharger')

    cy.getDataCy('map-account-box').contains('Taille des cartes téléchargées')

    cy.get('*[data-cy="map-property-trigger"]').filter(':contains("les cartes en local")').click()

    cy.contains('Êtes-vous sûr de désactiver le téléchargement des cartes en local ?').should('be.visible')

    cy.clickButton('Désactiver')
  })

  it('Should open the backoffice in a new tab', () => {
    cy.window().then(window => {
      cy.stub(window, 'open').as('windowOpen')
    })

    cy.clickButton('Mon compte', { withoutScroll: true })
    cy.clickButton('Accéder au backoffice')

    cy.get('@windowOpen').should('have.been.calledWith', '/backoffice', '_blank', 'noopener')
  })

  it('Should not display the backoffice access to a non super user', () => {
    cy.login('user')
    cy.visit('/')
    cy.wait(5000)

    cy.clickButton('Mon compte', { withoutScroll: true })

    cy.getDataCy('map-account-box').contains('another@email.com')
    cy.getDataCy('map-account-box').should('not.contain', 'Accéder au backoffice')
  })
})
