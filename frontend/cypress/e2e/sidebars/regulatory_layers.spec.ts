// import { encodeUriObject } from '../../src/utils/encodeUriObject'

context('Sidebars > Regulatory Layers', () => {
  beforeEach(() => {
    cy.login('superuser')
  })

  it('A regulation Should be searched, added to My Zones and showed on the map with the Zone button', () => {
    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    /**
     * The number of zones searched and total zones in law type should be displayed
     */
    // When
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[name="Rechercher une zone réglementaire"]').type('interdiction')

    // Then, 2 zones are showed
    cy.get('*[data-cy="regulatory-layer-topic-count"]').contains('2/4')

    /**
     * A regulation Should be searched, added to My Zones and showed on the map with the Zone button
     */
    // When
    cleanRegulationSearchInput()

    // Add the layer to My Zones
    cy.get('*[name="Rechercher une zone réglementaire"]').type('Cotentin biva')
    cy.contains('Ouest Cotentin Bivalves').click()
    cy.get('*[data-cy="regulatory-layer-topic-count"]').contains('1/1')
    cy.get('[title=\'Sélectionner "Praires Ouest cotentin"\']').click()

    // Then it is in "My Zones"
    cleanRegulationSearchInput()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-zone"]').contains('Praires Ouest cotentin')

    // Show a zone with the zone button
    cy.log('Show a zone with the zone button')
    // This intercept only works in the CI, as localhost in used in local
    cy.intercept(
      'http://*:8081/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:regulations&outputFormat=application/json&CQL_FILTER=topic=%27Ouest%20Cotentin%20Bivalves%27%20AND%20zone=%27Praires%20Ouest%20cotentin%27'
    ).as('getRegulation')
    cy.get('[title=\'Afficher la zone "Praires Ouest cotentin"\']').click()
    cy.wait('@getRegulation').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.wait(200)

    cy.get('.regulatory', { timeout: 10000 }).click(490, 580, { force: true, timeout: 10000 })
    cy.wait('@getRegulation').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]').contains('Reg. MEMN')

    // When F5 is pressed, the zones are still showed
    cy.reload()
    cy.get('.regulatory', { timeout: 10000 }).click(490, 580, { force: true, timeout: 10000 })
    cy.wait('@getRegulation').then(({ response }) => expect(response && response.statusCode).equal(200))
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]').contains('Reg. MEMN')

    // Close the metadata modal and hide the zone
    cy.get('*[data-cy="regulatory-layers-metadata-close"]').click()
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()
    cy.get('[title=\'Cacher la zone "Praires Ouest cotentin"\']').click()

    // The layer is hidden, the metadata modal should not be opened
    cy.get('.regulatory', { timeout: 10000 }).should('not.exist')
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]', { timeout: 10000 }).should('not.exist')

    /**
     * A regulation Should be searched and the result Should be kept When we go to My Zones section
     */
    // Add the layer to My Zones
    cy.get('*[name="Rechercher une zone réglementaire"]').type('Cotentin biva')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 1)

    // Then go to "My Zones"
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 0)

    // Back to the search result
    cy.clickButton('Afficher les résultats de la recherche')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 1)

    // Back to My Zones
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
  })

  it('A regulation Should be searched, added to My Zones and showed on the map with the Topic button', () => {
    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    // When
    cy.get('[title="Arbre des couches"]').click()

    // Add the layer to My Zones
    cy.get('*[name="Rechercher une zone réglementaire"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layer-topic"]').eq(0).click()
    cy.get('[title=\'Sélectionner "Praires Ouest cotentin"\']').click()

    // Then it is in "My Zones"
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-zone"]').contains('Praires Ouest cotentin')

    // Show a zone with the topic button
    cy.log('Show a zone with the topic button')
    cy.get('[title=\'Afficher la thématique "Ouest Cotentin Bivalves"\']').click()
    cy.wait(200)

    cy.get('canvas').eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]').contains('Reg. MEMN')
    cy.get('*[data-cy="regulatory-layers-metadata-close"]').click()

    // Delete the zone
    cy.get('[title=\'Supprimer la zone "Praires Ouest cotentin" de ma sélection\']').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').should('not.exist')

    // The layer is hidden, the metadata modal should not be opened
    cy.get('canvas').eq(0).click(490, 580, { force: true, timeout: 10000 })
    cy.get('*[data-cy="regulatory-layers-metadata-lawtype"]', { timeout: 10000 }).should('not.exist')

    // Close the layers sidebar
    cy.get('[title="Arbre des couches"]').click()
  })

  it('The Cotentin regulation metadata Should be opened', () => {
    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    // When
    cy.get('[title="Arbre des couches"]').click()

    cy.get('*[name="Rechercher une zone réglementaire"]').type('Cotentin')
    cy.get('*[data-cy="regulatory-layer-topic"]').eq(0).click({ timeout: 10000 })
    cy.get('[title=\'Sélectionner "Praires Ouest cotentin"\']').click()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()

    // Then show the metadata
    cy.get('[title=\'Afficher la réglementation "Praires Ouest cotentin"\']').click()
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

    cy.get('*[data-cy="regulatory-layers-metadata-other-info"]').contains('Encore une info importante')

    cy.get('*[data-cy="regulatory-layers-metadata-references"]').should('have.length', 1)
  })

  it('The Armor regulation metadata Should be opened', () => {
    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    // When
    cy.get('[title="Arbre des couches"]').click()

    cy.get('*[name="Rechercher une zone réglementaire"]').type('Armor')
    cy.get('*[data-cy="regulatory-layer-topic"]').eq(0).click({ timeout: 10000 })
    cy.get('[title=\'Sélectionner "Secteur 3"\']').click()
    cy.get('*[data-cy="regulatory-layers-my-zones"]').click()
    cy.get('*[data-cy="regulatory-layers-my-zones-topic"]').click()

    // Then show the metadata
    cy.get('[title=\'Afficher la réglementation "Secteur 3"\']').click()
    cy.get('*[data-cy="regulatory-layers-metadata-region"]').should('exist')
    cy.get('*[data-cy="regulatory-layers-metadata-fishing-period"]').contains('Vraiment, regarde Légipêche!')

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

  it('A regulation Should be searched with a rectangle', () => {
    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    // When
    cy.intercept(
      'GET',
      `http://*:8081/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:regulations&outputFormat=application/json&srsname=EPSG:4326&bbox=-378334.88336741074,6265784.372024373,-280465.66220758925,6284605.376093569,EPSG:3857&propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region`
    ).as('getFeature')
    cy.get('[title="Arbre des couches"]').click()

    cy.get('*[data-cy="regulatory-layers-advanced-search"]').click()
    cy.get('*[data-cy="regulation-search-box-filter"]').click()

    cy.get('canvas').eq(0).click(490, 560, { force: true, timeout: 10000 })
    cy.get('canvas').eq(0).click(230, 610, { force: true, timeout: 10000 })
    cy.wait('@getFeature').then(({ request, response }) => {
      expect(request.url).contains('propertyName=id,law_type,topic,gears,species,regulatory_references,zone,region')
      expect(response && response.statusCode).equal(200)
    })

    cy.get('*[data-cy="regulation-search-box-filter"]').should('not.exist')
    cy.get('*[data-cy="regulation-search-box-filter-selected"]').should('exist')
    cy.get('*[data-cy="regulatory-layer-topic"]').should('have.length', 2)
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Ouest Cotentin Bivalves')
    cy.get('*[data-cy="regulatory-layer-topic"]').first().click()
    cy.get('*[data-cy="regulatory-layer-topic"]').contains('Armor CSJ')

    cy.get('[title=\'Afficher la réglementation "Praires Ouest cotentin"\']').click()
    // No zoom is triggered when drawing a zone
    cy.url().should('include', '/#@-224002.65,6302673.54,8.70')

    cy.contains('Effacer la zone définie').parent().find('button').click()
    cy.get('*[data-cy="regulation-search-box-filter"]').should('exist')
    cy.get('*[data-cy="regulation-search-box-filter-selected"]').should('not.exist')
  })

  it('A regulation Should be searched with a polygon', () => {
    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    // When
    cy.get('[title="Arbre des couches"]').click()

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

    cy.contains('Effacer la zone définie').parent().find('button').click()
    cy.get('*[data-cy="regulation-search-box-filter"]').should('exist')
    cy.get('*[data-cy="regulation-search-box-filter-selected"]').should('not.exist')
  })

  it('An administrative zone Should be showed and hidden', () => {
    const LOCALSTORAGE_URL = Cypress.config().baseUrl
    if (!LOCALSTORAGE_URL) {
      throw new Error('`baseUrl` is not defined')
    }

    cy.visit('/#@-224002.65,6302673.54,8.70')
    cy.wait(1000)

    // TODO Investigate why there is white space in the Cypress iframe when hiding vessels which breaks the entire test.
    // cy.clickButton('Affichage des dernières positions')
    // cy.contains('Masquer les navires non sélectionnés').click()
    // cy.clickButton('Affichage des dernières positions')

    cy.cleanScreenshots(1)
    cy.getAllLocalStorage().then(localStorages => {
      const testLocalStorage = localStorages[LOCALSTORAGE_URL]
      const showedLayers = JSON.parse(testLocalStorage?.homepagelayersShowedOnMap as string)
      expect(showedLayers).to.be.empty
    })

    // When
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[data-cy="administrative-zones-open"]').click({ force: true, timeout: 10000 })
    cy.get('*[data-cy="administrative-layer-toggle"]')
      .eq(0)
      .click({ force: true, timeout: 10000 })
      .then(() => {
        cy.getAllLocalStorage().then(localStorages => {
          const testLocalStorage = localStorages[LOCALSTORAGE_URL]
          const showedLayers = JSON.parse(testLocalStorage?.homepagelayersShowedOnMap as string)
          expect(showedLayers).length(1)
          expect(showedLayers[0].type).equal('eez_areas')
        })
      })
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

    // Refresh and check the item in local storage is not deleted
    cy.reload()
    cy.wait(2000)
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[data-cy="administrative-zones-open"]')
      .click({ force: true, timeout: 10000 })
      .then(() => {
        cy.getAllLocalStorage().then(localStorages => {
          const testLocalStorage = localStorages[LOCALSTORAGE_URL]
          const showedLayers = JSON.parse(testLocalStorage?.homepagelayersShowedOnMap as string)
          expect(showedLayers).length(1)
          expect(showedLayers[0].type).equal('eez_areas')
        })
      })
  })

  it('Should unselect one of the selected topic zone layers', () => {
    // Focus the map on Corsica
    cy.visit('/#@997505.75,5180266.24,8.70')
    cy.wait(500)

    // TODO Investigate why there is white space in the Cypress iframe when hiding vessels which breaks the entire test.
    // cy.clickButton('Affichage des dernières positions')
    // cy.contains('Masquer les navires non sélectionnés').click()
    // cy.clickButton('Affichage des dernières positions')

    // Select all the "Corse - Chaluts" regulation zones
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[name="Rechercher une zone réglementaire"]').type('Corse')
    cy.get('[title=\'Sélectionner "Corse - Chaluts"\']').click()
    cy.contains('Mes zones réglementaires').click()

    // Show all the "Corse - Chaluts" regulation zone layers
    cy.get('[title=\'Afficher la thématique "Corse - Chaluts"\']').click()

    // Unselect one of the "Corse - Chaluts" regulation zones
    cy.contains('Corse - Chaluts').click()
    cy.get('[title=\'Supprimer la zone "Interdiction temporaire - Chalut à panneaux" de ma sélection\']').click()

    cy.get('.regulatory').toMatchImageSnapshot({
      screenshotConfig: {
        clip: { height: 960, width: 480, x: 440, y: 25 }
      }
    })

    // Select the removed zone again
    cy.contains('Afficher les résultats').click()
    cy.contains('Corse - Chaluts').first().click()
    cy.get('[title=\'Sélectionner "Interdiction temporaire - Chalut à panneaux"\']').click()

    cy.contains('Mes zones réglementaires').click()
    cy.contains('Mes zones réglementaires').parent().contains('Interdiction temporaire').should('be.visible')
    cy.contains('Mes zones réglementaires').parent().contains('6 MN').should('be.visible')
    cy.contains('Mes zones réglementaires').parent().contains('1,5 - 3 MN').should('be.visible')
    cy.contains('Mes zones réglementaires').parent().contains('3 - 12 MN').should('be.visible')
  })

  it('Should toggle the selected topic zone layers', () => {
    // Focus the map on Corsica
    cy.visit('/#@997505.75,5180266.24,8.70')
    cy.wait(500)

    // Select all the "Corse - Chaluts" regulation zones
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[name="Rechercher une zone réglementaire"]').type('Corse')
    cy.get('[title=\'Sélectionner "Corse - Chaluts"\']').click()
    cy.contains('Mes zones réglementaires').click()

    // Show metadata for one of the "Corse - Chaluts" regulation zones
    cy.contains('Corse - Chaluts').click()
    cy.get('[title=\'Afficher la réglementation "6 MN : Interdiction du chalut de fond"\']').click()

    // Check a few of its metadata values
    cy.contains('Reg. MED').should('be.visible')
    cy.contains('Pêche interdite tous les ans').should('be.visible')
    cy.contains('Création et Réglementation de zone').should('be.visible')

    // Unselect one of the "Corse - Chaluts" regulation zones
    cy.get('[title=\'Supprimer la zone "Interdiction temporaire - Chalut à panneaux" de ma sélection\']').click()

    // Select all the "Armor CSJ Dragues" regulation zones (there is only 1)
    // Clean input
    cleanRegulationSearchInput()
    cy.get('*[name="Rechercher une zone réglementaire"]').type('Armor')
    cy.get('[title=\'Sélectionner "Armor CSJ Dragues"\']').click()

    // Show metadata the only "Armor CSJ Dragues" regulation zone
    cleanRegulationSearchInput()
    cy.contains('Mes zones réglementaires').click()
    cy.contains('Mes zones réglementaires').parent().contains('Armor CSJ Dragues').click()
    cy.get('[title=\'Afficher la réglementation "Secteur 3"\']').click()

    // Check a few of its metadata values
    cy.contains('Reg. MEMN').should('be.visible')
    cy.contains('Tous les engins trainants').should('be.visible')
    cy.contains('Création de zone').should('be.visible')
  })

  function cleanRegulationSearchInput() {
    cy.get('*[name="Rechercher une zone réglementaire"]').parent().find('.Element-IconButton').click()
  }
})
