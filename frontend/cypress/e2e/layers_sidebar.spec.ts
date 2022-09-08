/* eslint-disable no-undef */
/// <reference types="cypress" />

context('LayersSidebar', () => {
  beforeEach(() => {
    cy.loadPath('/#@-224002.65,6302673.54,8.70')

    cy.request(
      'GET',
      'http://localhost:8081/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=' +
        'monitorfish:regulations&outputFormat=application/json&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region,next_id'
    ).then(response => {
      cy.log(response.body)
    })
  })

  it('A regulation Should be searched, added to My Zones and showed on the map with the Zone button', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    // Add the layer to My Zones
    cy.get('*[data-cy="regulatory-search-input"]').type('Cotentin biva')
    cy.get('*[data-cy="regulatory-layer-topic"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-zone-check"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-search-add-zones-button"]').contains('Ajouter 1 zone')
    cy.get('*[data-cy="regulatory-search-add-zones-button"]').click()

    // Then it is in "My Zones"
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-zone"]').contains('Praires Ouest cotentin')

    // Show a zone with the zone button
    cy.log('Show a zone with the zone button')
    cy.get('*[data-cy="regulatory-layers-my-zones-zone-show"]').eq(0).click({ timeout: 10000 })
    cy.wait(200)

    cy.get('canvas', { timeout: 10000 }).eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]').contains('Reg. MEMN')

    // Close the metadata modal and hide the zone
    cy.get('*[data-cy="regulatory-layers-metadata-close"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-zone-hide"]').eq(0).click({ timeout: 10000 })

    // The layer is hidden, the metadata modal should not be opened
    cy.get('canvas', { timeout: 10000 }).eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]', { timeout: 10000 }).should('not.exist')
  })

  it('A regulation Should be searched, added to My Zones and showed on the map with the Topic button', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    // Add the layer to My Zones
    cy.get('*[data-cy="regulatory-search-input"]').type('Cotentin', { force: true })
    cy.get('*[data-cy="regulatory-layer-topic"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-zone-check"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-search-add-zones-button"]').contains('Ajouter 1 zone')
    cy.get('*[data-cy="regulatory-search-add-zones-button"]').click()

    // Then it is in "My Zones"
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-zone"]').contains('Praires Ouest cotentin')

    // Show a zone with the topic button
    cy.log('Show a zone with the topic button')
    cy.get('*[data-cy="regulatory-layers-my-zones-topic-show"]').eq(0).click({ timeout: 10000 })
    cy.wait(200)

    cy.get('canvas').eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]').contains('Reg. MEMN')
    cy.get('*[data-cy="regulatory-layers-metadata-close"]').click()

    // Delete the zone
    cy.get('*[data-cy="regulatory-layers-my-zones-zone-delete"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]', { timeout: 10000 }).should('not.exist')

    // The layer is hidden, the metadata modal should not be opened
    cy.get('canvas').eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]', { timeout: 10000 }).should('not.exist')

    // Close the layers sidebar
    cy.get('*[data-cy="layers-sidebar"]', { timeout: 10000 }).click({ timeout: 10000 })
  })

  it('The Cotentin regulation metadata Should be opened', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    cy.get('*[data-cy="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layer-topic"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-zone-check"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-search-add-zones-button"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()

    // Then show the metadata
    cy.get('*[data-cy="regulatory-layers-show-metadata"]').click()
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]').contains('Reg. MEMN')
    cy.get('*[data-cy="regulatory-layers-metadata-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layers-metadata-zone"]').contains('Praires Ouest cotentin')
    cy.get('*[data-cy="regulatory-layers-metadata-region"]').contains('Normandie, Bretagne')

    cy.get('*[data-cy="regulatory-layers-metadata-fishing-period"]').contains(
      'Pêche interdite les vendredi, samedi et dimanche, les jours fériés'
    )
    cy.get('*[data-cy="regulatory-layers-metadata-fishing-period"]').contains('Bien vérifier Légipêche!')

    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains('TBN (Chaluts à langoustines)')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains('inférieur à 123 mm')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains('Attention à cette espèce!')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains('Dragues')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains(
      'li',
      'Drague sans dent et de largeur maximale 1,30 mètre'
    )
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains('li', 'Dragues avec dents !')
    cy.get('*[data-cy="regulatory-layers-metadata-gears-category-with-infobox"]').should(
      'have.attr',
      'title',
      'DHS - Drague à main manœuvrée à partir du rivage \n' +
        'DHB - Drague à main manœuvrée à partir du bateau \n' +
        'HMD - Dragues mécanisées incluant les dragues suceuses \n' +
        "DRH - Dragues à main utilisées à bord d'un bateau \n" +
        'DRB - Dragues remorquées par bateau \n' +
        'DRM - Dragues mécanisées \n'
    )

    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains('URC (OURSINS NCA)')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains('li', 'Pas plus de 500kg')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains('li', 'Autre remarque')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains('URX (OURSINS,ETC. NCA)')

    cy.get('*[data-cy="regulatory-layers-metadata-references"]').should('have.length', 1)
  })

  it('The Armor regulation metadata Should be opened', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    cy.get('*[data-cy="regulatory-search-input"]').type('Armor')
    cy.get('*[data-cy="regulatory-layer-topic"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-zone-check"]').click({ timeout: 10000 })
    cy.get('*[data-cy="regulatory-search-add-zones-button"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()

    // Then show the metadata
    cy.get('*[data-cy="regulatory-layers-show-metadata"]').click()
    cy.get('*[data-cy="regulatory-layers-metadata-region"]').should('exist')
    cy.log('Fishing period should not be seen if it has an empty message')
    cy.get('*[data-cy="regulatory-layers-metadata-fishing-period"]').should('not.exist')

    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears"]').contains('Tous les engins trainants')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-gears-towed-gears"]')
      .children()
      .should('have.attr', 'title', 'Chaluts, dragues et sennes traînantes')

    cy.get('*[data-cy="unauthorized-regulatory-layers-metadata-gears"]').contains('Tous les engins dormants')
    cy.get('*[data-cy="unauthorized-regulatory-layers-metadata-gears-passive-gears"]')
      .children()
      .should(
        'have.attr',
        'title',
        'Filets maillants et emmêlants, filets soulevés, pièges et casiers, lignes et hameçons'
      )
    cy.get('*[data-cy="unauthorized-regulatory-layers-metadata-gears"]').contains('Chaluts')
    cy.get('*[data-cy="unauthorized-regulatory-layers-metadata-gears"]').contains('Dragues')
    cy.get('*[data-cy="unauthorized-regulatory-layers-metadata-gears"]').contains('Engins non autorisés')
    cy.get('*[data-cy="regulatory-layers-metadata-gears-other-info"]').contains(
      'Encore une dernière information sur les engins !'
    )

    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains("HKE (MERLU D'EUROPE)")
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains('li', 'Pas plus que ça')
    cy.get('*[data-cy="authorized-regulatory-layers-metadata-species"]').contains('li', 'OK')

    cy.get('*[data-cy="unauthorized-regulatory-layers-metadata-species"]').contains('Toutes les espèces')
  })

  it('An advanced search Should filter the search result', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    cy.get('*[data-cy="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layers-advanced-search"]').click()

    cy.get('*[data-cy="regulatory-layers-advanced-search-zone"]').type('MEMN')
    cy.get('*[data-cy="regulatory-layers-advanced-search-gears"]').type('DRB')
    cy.get('*[data-cy="regulatory-layers-advanced-search-species"]').type('VEV')
    cy.get('*[data-cy="regulatory-layers-advanced-search-reg"]').type('168/2020')
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Ouest Cotentin Bivalves')
  })

  it('A regulation Should be searched with a rectangle', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    cy.get('*[data-cy="regulatory-layers-advanced-search"]').click()
    cy.get('*[data-cy="regulation-search-box-filter"]').click()

    cy.get('canvas').eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('canvas').eq(0).click(230, 630, { force: true, timeout: 10000 })

    cy.get('*[data-cy="regulation-search-box-filter"]').should('not.exist')
    cy.get('*[data-cy="regulation-search-box-filter-selected"]').should('exist')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 2)
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Armor CSJ')

    cy.get('*[data-cy="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 1)

    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(0).click()
    cy.get('*[data-cy="regulation-search-box-filter"]').should('exist')
    cy.get('*[data-cy="regulation-search-box-filter-selected"]').should('not.exist')
  })

  it('A regulation Should be searched with a polygon', () => {
    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })

    cy.get('*[data-cy="regulatory-layers-advanced-search"]').click()
    cy.get('*[data-cy="regulation-search-polygon-filter"]').click()

    cy.get('canvas').eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('canvas').eq(0).click(230, 630, { force: true, timeout: 10000 })
    cy.get('canvas').eq(0).dblclick(300, 700, { force: true, timeout: 10000 })

    cy.get('*[data-cy="regulation-search-polygon-filter"]').should('not.exist')
    cy.get('*[data-cy="regulation-search-polygon-filter-selected"]').should('exist')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 2)
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Armor CSJ')

    cy.get('*[data-cy="regulatory-search-input"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 1)

    cy.get('*[data-cy="vessel-filter-remove-tag"]').eq(0).click()
    cy.get('*[data-cy="regulation-search-box-filter"]').should('exist')
    cy.get('*[data-cy="regulation-search-box-filter-selected"]').should('not.exist')
  })

  it('An administrative zone Should be showed and hidden', () => {
    cy.cleanScreenshots(1)

    // When
    cy.get('*[data-cy="layers-sidebar"]').click({ timeout: 10000 })
    cy.get('*[data-cy="administrative-zones-open"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="administrative-layer-toggle"]').eq(0).click({ timeout: 10000 })
    cy.wait(500)

    // Then
    cy.get('.administrative').toMatchImageSnapshot({
      imageConfig: {
        threshold: 0.05,
        thresholdType: 'percent'
      },
      screenshotConfig: {
        clip: { height: 500, width: 250, x: 410, y: 0 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
