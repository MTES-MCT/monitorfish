// import { encodeUriObject } from '../../src/utils/encodeUriObject'

const CUSTOM_ZONES_LOCALSTORAGE_KEY = 'persist:mainPersistorCustomZone'

context('Sidebars > Custom Zones', () => {
  it('A custom zone Should be showed and hidden', () => {
    cy.clearLocalStorage()
    cy.loadPath('/#@-9649561.29,3849836.62,7.84')

    cy.cleanScreenshots(1)

    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="custom-zones-toggle"]').click({ force: true, timeout: 10000 })

    // TODO Fix custom zone not showed on startup

    // Then
    cy.get('.CUSTOM').toMatchImageSnapshot({
      imageConfig: {
        threshold: 0.05,
        thresholdType: 'percent'
      },
      screenshotConfig: {
        clip: { height: 1000, width: 600, x: 410, y: 0 }
      }
    })

    cy.get('*[data-cy="custom-zone-show-toggle"]')
      .eq(0)
      .click()
      .then(() => {
        const customZonesItem = JSON.parse(localStorage.getItem(CUSTOM_ZONES_LOCALSTORAGE_KEY) || '')
        const zones = JSON.parse(customZonesItem.zones)
        expect(zones['b2f8aea3-7814-4247-98fa-ddc58c922d09'].isShown).equal(false)
      })
    cy.cleanScreenshots(1)
  })
})
