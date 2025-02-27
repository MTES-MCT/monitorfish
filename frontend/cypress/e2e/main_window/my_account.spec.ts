context('Main Window > My Account', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.login('superuser')
    cy.visit(`/`, {
      onBeforeLoad(window) {
        Object.defineProperty(window.navigator, 'serviceWorker', {
          value: {
            register: () => Promise.resolve({
              addEventListener: () => {},
            }),
            getRegistration: () => Promise.resolve({
              update: () => {},
            }),
            getRegistrations: () => Promise.resolve([]),
            addEventListener: () => {}
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

    cy.contains('Êtes-vous sûr d\'activer le téléchargement des cartes en local ?').should('be.visible')

    cy.clickButton('Activer et recharger')

    cy.getDataCy("map-account-box").contains('Taille des cartes téléchargées')

    cy.get('*[data-cy="map-property-trigger"]').filter(':contains("les cartes en local")').click()

    cy.contains('Êtes-vous sûr de désactiver le téléchargement des cartes en local ?').should('be.visible')

    cy.clickButton('Désactiver')
  })

})
