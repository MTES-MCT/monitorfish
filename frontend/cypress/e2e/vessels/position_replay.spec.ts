import { customDayjs } from '@mtes-mct/monitor-ui'

import { openVesselBySearch } from '../main_window/utils'
import { getUtcDateInMultipleFormats } from '../utils/getUtcDateInMultipleFormats'

// See `V666.46__Insert_dummy_replayed_positions.sql`
const AIGLE_CALME = 'VESSELS_POINTS:ABC010511983/IRCS132/EXTIMM132'
const AIGLE_CINQUANTE_NEUF = 'VESSELS_POINTS:ABC011871989/IRCS133/EXTIMM133'
const AIGLE_CRYPTEE = 'VESSELS_POINTS:ABC012312001/IRCS134/EXTIMM134'

context('Position replay', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-503013.39,6029552.02,9.00')
    cy.wait(1000)
  })

  it('Vessels Should be replayed 5 days ago with their track and logbook, and the current positions displayed when quitting', () => {
    const { utcDateAsDayjs } = getUtcDateInMultipleFormats(customDayjs().subtract(5, 'day').toISOString())
    const replayedAt = utcDateAsDayjs.startOf('minute')
    const replayedAtTuple: [number, number, number, number, number] = [
      replayedAt.year(),
      replayedAt.month() + 1,
      replayedAt.date(),
      replayedAt.hour(),
      replayedAt.minute()
    ]
    cy.intercept('GET', '/bff/v1/vessels/replay*').as('getReplayedVessels')
    cy.intercept('GET', '/bff/v1/vessels/ais/replay*').as('getReplayedAISVessels')

    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.clickButton('Rejouer les positions à une date passée')

    // Then no position is displayed until a date is entered
    cy.getDataCy('position-replay-dialog').should('be.visible')
    cy.getDataCy('position-replay-headband').should('not.exist')
    cy.getFeaturesFromLayer('VESSELS_POINTS').should(features => {
      expect(features.length).to.equal(0)
    })

    // When
    cy.fill('Date et heure de rejeu des positions', replayedAtTuple)

    // Then
    cy.wait('@getReplayedVessels').then(({ request, response }) => {
      expect(request.query.dateTime).to.equal(replayedAt.toISOString())

      const replayedVessels: Array<Record<string, any>> = response?.body ?? []
      const vesselFeatureIds = replayedVessels.map(vessel => vessel.vesselFeatureId)
      expect(vesselFeatureIds).to.include(AIGLE_CALME)
      expect(vesselFeatureIds).to.include(AIGLE_CINQUANTE_NEUF)
      // Its last position is older than the 6 hours VMS look-back
      expect(vesselFeatureIds).not.to.include(AIGLE_CRYPTEE)

      const aigleCalme = replayedVessels.find(vessel => vessel.vesselFeatureId === AIGLE_CALME)
      expect(aigleCalme?.vesselName).to.equal('AIGLE CALME')
      expect(aigleCalme?.positionType).to.equal('VMS')
      expect(aigleCalme?.length).to.be.a('number')
      expect(aigleCalme?.riskFactor).to.equal(undefined)
      expect(customDayjs(aigleCalme?.dateTime).isAfter(replayedAt)).to.equal(false)

      // Its AIS positions are more recent than its VMS positions
      const aigleCinquanteNeuf = replayedVessels.find(vessel => vessel.vesselFeatureId === AIGLE_CINQUANTE_NEUF)
      expect(aigleCinquanteNeuf?.positionType).to.equal('AIS')
    })
    cy.wait('@getReplayedAISVessels').then(({ response }) => {
      const replayedAISVessels: Array<Record<string, any>> = response?.body ?? []
      const replayedAISVesselNames = replayedAISVessels.map(vessel => vessel.vesselName)
      expect(replayedAISVesselNames).to.include('LUCIOLE')
    })

    cy.getFeaturesFromLayer('VESSELS_POINTS').should(features => {
      const featureIds = features.map(feature => feature.getId())
      expect(featureIds).to.include(AIGLE_CALME)
      expect(featureIds).to.include(AIGLE_CINQUANTE_NEUF)
      expect(featureIds).not.to.include(AIGLE_CRYPTEE)

      // The "last position less than 3 hours ago" default filter is relative to the replayed date
      const aigleCalmeFeature = features.find(feature => feature.getId() === AIGLE_CALME)
      expect(aigleCalmeFeature?.get('isFiltered')).to.equal(1)
    })
    cy.getDataCy('position-replay-headband')
      .should('be.visible')
      .contains('Vous affichez les pistes des navires dans le passé.')
    cy.get('[title="Avancer de 1j"]').should('not.be.disabled')

    /**
     * The vessel track Should end at the replayed date, and the logbook Should be the trip at this date
     */

    // When
    cy.intercept('GET', '/bff/v1/vessels/find*').as('getReplayedVesselAndTrack')
    cy.intercept('GET', '/bff/v1/vessels/logbook/find?*').as('getReplayedLogbook')
    openVesselBySearch('AIGLE CALME')

    // Then
    cy.wait('@getReplayedVesselAndTrack').then(({ request, response }) => {
      expect(request.query.trackDepth).to.equal('CUSTOM')
      expect(request.query.afterDateTime).to.equal(replayedAt.subtract(12, 'hour').toISOString())
      expect(request.query.beforeDateTime).to.equal(replayedAt.toISOString())
      // One VMS position per hour
      expect(response?.body.positions).to.have.length(12)
    })
    // The trip during which the vessel was at sea at the replayed date, not its current trip
    cy.wait('@getReplayedLogbook').then(({ request, response }) => {
      expect(request.query.voyageRequest).to.equal('AT_DATE_TIME')
      expect(request.query.dateTime).to.equal(replayedAt.toISOString())
      expect(response?.body.tripNumber).to.equal('20261101')
    })
    cy.getFeaturesFromLayer('VESSEL_TRACK').should(features => {
      expect(features.length).to.be.greaterThan(0)
    })
    // The summary shows the last replayed VMS position
    cy.getDataCy('vessel-menu-summary').click()
    cy.getDataCy('vessel-summary-latitude').should('not.contain', '-')
    cy.contains('1 signal toutes les 60 minutes').should('be.visible')
    cy.contains("En mode rejeu, la note de risque n'est pas calculée.").should('be.visible')
    cy.contains('En mode rejeu, les groupes du navire ne sont pas affichés.').should('be.visible')

    /**
     * The current positions Should be displayed again when quitting
     */

    // When
    cy.intercept('GET', '/bff/v1/vessels').as('getActiveVessels')
    cy.getDataCy('position-replay-headband').contains('Quitter le mode rejeu des positions').click()

    // Then
    cy.wait('@getActiveVessels')
    cy.getDataCy('position-replay-dialog').should('not.exist')
    cy.getDataCy('position-replay-headband').should('not.exist')
    cy.getDataCy('vessel-sidebar').should('not.exist')
    cy.getFeaturesFromLayer('VESSELS_POINTS').should(features => {
      const featureIds = features.map(feature => feature.getId())
      expect(featureIds).not.to.include(AIGLE_CALME)
    })
  })

  it('The headband Should be collapsed on demand and expanded again on the next replay', () => {
    const { utcDateAsDayjs } = getUtcDateInMultipleFormats(customDayjs().subtract(5, 'day').toISOString())
    const replayedAtTuple: [number, number, number, number, number] = [
      utcDateAsDayjs.year(),
      utcDateAsDayjs.month() + 1,
      utcDateAsDayjs.date(),
      utcDateAsDayjs.hour(),
      utcDateAsDayjs.minute()
    ]

    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.clickButton('Rejouer les positions à une date passée')
    cy.fill('Date et heure de rejeu des positions', replayedAtTuple)
    cy.getDataCy('position-replay-headband').should('be.visible')

    // When
    cy.getDataCy('position-replay-headband').parents('.Component-Banner').find('.banner-button').click()

    // Then the headband is collapsed and the replay goes on
    cy.getDataCy('position-replay-headband').should('not.exist')
    cy.getDataCy('position-replay-dialog').should('be.visible')

    // When
    cy.clickButton('Quitter le mode rejeu des positions')
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.clickButton('Rejouer les positions à une date passée')
    cy.fill('Date et heure de rejeu des positions', replayedAtTuple)

    // Then
    cy.getDataCy('position-replay-headband').should('be.visible')
  })

  it('Live-only features Should be disabled while replaying and restored as they were when quitting', () => {
    const DISABLED_TITLE = '[title="Indisponible en mode rejeu des positions"]'

    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.contains('Masquer la note de risque des navires').should('be.visible')
    cy.contains('Masquer les positions estimées des navires').should('be.visible')

    // When
    cy.clickButton('Rejouer les positions à une date passée')
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })

    // Then
    cy.contains(DISABLED_TITLE, 'Afficher la note de risque des navires').should('be.visible')
    cy.contains(DISABLED_TITLE, 'Afficher les positions estimées des navires').should('be.visible')
    // A display preference, not a data: it is still available
    cy.contains('les navires non sélectionnés').parent().parent().should('not.have.attr', 'title')

    cy.contains(DISABLED_TITLE, 'Afficher la note de risque des navires').click()
    cy.contains('Afficher la note de risque des navires').should('be.visible')

    cy.clickButton('Groupes de navires')
    cy.contains(DISABLED_TITLE, 'les navires hors des groupes affichés').should('be.visible')

    cy.clickButton('Missions et contrôles')
    cy.get('[title="Afficher les missions (indisponible en mode rejeu des positions)"]').should('be.disabled')

    // When
    cy.clickButton('Quitter le mode rejeu des positions')

    // Then
    cy.get('[title="Cacher les missions"]').should('not.be.disabled')
    cy.contains('Masquer la note de risque des navires').should('be.visible')
    cy.contains('Masquer les positions estimées des navires').should('be.visible')
    cy.get(DISABLED_TITLE).should('not.exist')
  })

  it('The reporting layer Should be unavailable while replaying, as only the open reportings are fetched', () => {
    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.clickButton('Rejouer les positions à une date passée')

    // When
    cy.clickButton('Signalements')

    // Then
    cy.contains('Pas de signalement en mode rejeu').should('be.visible')
    cy.get('[title="Afficher les signalements (indisponible en mode rejeu des positions)"]').should('be.disabled')
    cy.get('[title="Définir une zone de filtre manuelle (indisponible en mode rejeu des positions)"]').should(
      'be.disabled'
    )
  })

  it('The replay Should be restored from the URL, and removed from the URL when quitting', () => {
    const replayedAt = customDayjs().utc().subtract(5, 'day').startOf('minute')
    cy.intercept('GET', '/bff/v1/vessels/replay*').as('getReplayedVessels')

    // When
    cy.visit(`/?replay=${replayedAt.toISOString()}#@-503013.39,6029552.02,9.00`)

    // Then
    cy.wait('@getReplayedVessels').then(({ request }) => {
      expect(request.query.dateTime).to.equal(replayedAt.toISOString())
    })
    cy.getDataCy('position-replay-headband').should('be.visible')
    cy.getDataCy('position-replay-dialog').should('be.visible')

    // When
    cy.clickButton('Quitter le mode rejeu des positions')

    // Then
    cy.location('search').should('not.contain', 'replay=')
    cy.location('hash').should('contain', '#@')
  })
})
