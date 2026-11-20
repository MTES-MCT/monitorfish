/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

// On any host: it is a stub when running locally (see `FRONTEND_OPEN_VESSEL_PHOTOS_API_URL`)
const OPEN_VESSEL_PHOTOS_VESSEL_URL = /^https?:\/\/[^/]+\/v1\/cfr\/[^/]+$/
const OPEN_VESSEL_PHOTOS_SUBMISSIONS_URL = /^https?:\/\/[^/]+\/v1\/submissions\?/

context('Vessel sidebar resume tab', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    openVesselBySearch('Pheno')

    // Then
    cy.getDataCy('vessel-name').contains('PHENOMENE (FR)')
    cy.getDataCy('global-risk-factor').contains('2.5')

    cy.getDataCy('impact-risk-factor').contains('2.1')
    cy.getDataCy('impact-risk-factor').click({ force: true, timeout: 10000 })
    cy.get(
      '[title="Segment(s) actuel(s) à partir des messages de captures\n\n' +
        'Nom : NWW10\n' +
        'Zones : 27.5.b, 27.6, 27.7\n' +
        'Engins : FPO, FIX\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : aucun\n" +
        'Espèce cible (≥ 20% du total des captures) : NEP"]'
    ).should('exist')
    cy.get('*[data-cy="Zones de la marée"]').contains('27.8.b, 27.8.c')
    cy.get('*[data-cy="Engin de la marée (FAR)"]').contains('Chaluts de fond à panneaux (OTB)')
    cy.get('*[data-cy="Majorité d\'espèces à bord"]').contains('Pélagique')
    cy.get('*[data-cy="Espèces cibles à bord"]').contains('NEP (≥ 20% du total des captures)')

    cy.getDataCy('probability-risk-factor').contains('2.0')
    cy.getDataCy('probability-risk-factor').click({ force: true, timeout: 10000 })
    cy.getDataCy('probability-risk-factor').next().contains('Probabilité d’infraction du segment')
    cy.getDataCy('risk-factor-infringementRiskLevel').contains('2.9 – élevée')
    cy.getDataCy('probability-risk-factor').next().contains('Fréquence d’infraction du navire')
    cy.getDataCy('risk-factor-infractionRateRiskFactor').contains('2.6 – Infractions répétées')
    cy.getDataCy('probability-risk-factor').next().contains('8 contrôles sur 5 ans ')
    cy.getDataCy('probability-risk-factor').next().contains('5 infractions pêche / 8 contrôles')

    cy.getDataCy('detectability-risk-factor').contains('3.0')
    cy.getDataCy('detectability-risk-factor').click({ force: true, timeout: 10000 })
    cy.getDataCy('detectability-risk-factor').next().contains('Priorité du segment')
    cy.getDataCy('risk-factor-priority-level').contains('2.6 – élevée')
    cy.getDataCy('detectability-risk-factor').next().contains('Priorité du navire')
    cy.getDataCy('detectability-risk-factor').next().contains('3.8 – Contrôles rares')

    cy.wait(200)
    cy.getDataCy('vessel-sidebar-beacon-malfunction').contains('NON-ÉMISSION VMS')

    cy.getDataCy('show-risk-factor-explanation-modal').click({ force: true, timeout: 10000 })

    cy.clickButton('Fermer')
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    /**
     * An alert should be shown on the vessel sidebar
     */
    // When
    openVesselBySearch('tempete couleur')

    // Then
    cy.getDataCy('vessel-sidebar-alert').contains('Pêche en ZEE française par un navire tiers', {
      timeout: 10000
    })
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    /**
     * Vessel with a recent profile
     */
    openVesselBySearch('CFR109')
    cy.getDataCy('impact-risk-factor').click({ force: true, timeout: 10000 })
    cy.get(
      '[title="Segment(s) ces 14 derniers jours\n\n' +
        'Nom : NWW10\n' +
        'Zones : 27.5.b, 27.6, 27.7\n' +
        'Engins : FPO, FIX\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : aucun\n" +
        'Espèce cible (≥ 20% du total des captures) : NEP"]'
    ).should('exist')

    /**
     * Fleet segments should be displayed also in the logbook tab
     */
    cy.getDataCy('vessel-menu-fishing').click({ timeout: 10000 })
    cy.getDataCy('vessel-menu-fishing').should('be.visible')
    cy.get(
      '[title="Segment(s) ces 14 derniers jours\n\n' +
        'Nom : NWW10\n' +
        'Zones : 27.5.b, 27.6, 27.7\n' +
        'Engins : FPO, FIX\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : aucun\n" +
        'Espèce cible (≥ 20% du total des captures) : NEP"]'
    ).should('exist')
    cy.get(
      '[title="Segment(s) ces 14 derniers jours\n\n' +
        'Nom : PEL03\n' +
        'Zones : 27.4, 27.7, 27.8, 27.9\n' +
        'Engins : OTB, PTB\n' +
        'Maillage min. : aucun\n' +
        'Maillage max. : aucun\n' +
        "Majorité d'espèces : Pélagiques\n" +
        'Espèce cible : aucune"]'
    ).should('exist')
  })

  it('Groups may be displayed, added and removed', () => {
    // When
    openVesselBySearch('tempete couleur')
    cy.wait(500)

    // Add a group
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselTwo')

    cy.clickButton('Ajouter le navire à un groupe fixe')
    cy.contains('li', 'Mission Thémis – semaine 04').click()
    cy.wait('@updateVesselTwo')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .scrollIntoView()
      .should('exist')
    cy.wait(200)

    // Remove the vessel from the group
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]')
      .next()
      .click({ force: true })
    cy.intercept('GET', `/bff/v1/vessels/find*`).as('updateVesselThree')
    cy.clickButton('Confirmer la suppression')
    cy.wait('@updateVesselThree')
    cy.get('[title="Mission Thémis – semaine 04 - Ciblage pour la mission de l\'IRIS (bordée A)."]').should('not.exist')
    cy.wait(200)
  })

  it('Vessel profile must be displayed', () => {
    // When
    openVesselBySearch('ABC000022984')

    cy.getDataCy('vessel-profile').contains('Profil du navire').scrollIntoView()

    // Gear
    // The scrollbar in Cypress is 6px width (in dev mode in Firefox the width is 422px)
    cy.get('[title="OTB (100.0%)"]').should('have.css', 'width', '416px').contains('OTB (100.0%)')

    // Species
    cy.get('[title="MNZ (73.4%)"]').should('have.css', 'width', '303px').contains('MNZ (73.4%)')
    cy.get('[title="LEZ (9.7%)"]').should('have.css', 'width', '31px').contains('LEZ')
    cy.get('[title="JOD (5.8%)"]').should('have.css', 'width', '15px').contains('JOD')
    cy.get('[title="WIT (3.0%)"]').should('have.css', 'width', '3px').and('have.prop', 'innerText', '')
    cy.get('[title="Autres (8.1%)"]').should('have.css', 'width', '25px').contains('Autres')

    // Fao zones
    cy.get('[title="27.7.b (98.2%)"]').should('have.css', 'width', '408px').contains('27.7.b (98.2%)')
    cy.get('[title="27.7.c.2 (1.8%)"]').should('have.css', 'width', '0px').and('have.prop', 'innerText', '')

    // Landing ports
    cy.get('[title="Brest (100.0%)"]').should('have.css', 'width', '416px').contains('Brest (100.0%)')
  })

  it('Vessel photo Should be displayed with its credits When Open Vessel Photos has one', () => {
    cy.intercept('GET', OPEN_VESSEL_PHOTOS_VESSEL_URL, {
      body: {
        photos: [
          {
            attribution: 'Photo: Jean Dupont / Open Vessel Photos (CC BY 4.0)',
            urls: { cfr: '/icone_navire_3B4559.png', mmsi: '/icone_navire_3B4559.png' }
          }
        ]
      }
    }).as('getOpenVesselPhoto')

    openVesselBySearch('Pheno')
    cy.wait('@getOpenVesselPhoto')

    cy.getDataCy('vessel-photo').find('img').should('have.attr', 'src', '/icone_navire_3B4559.png')
    cy.getDataCy('vessel-photo').contains('Photo: Jean Dupont / Open Vessel Photos (CC BY 4.0)')
    cy.getDataCy('vessel-photo-missing').should('not.exist')
  })

  it('Vessel photo Should invite to add a photo on Open Vessel Photos When there is none', () => {
    openVesselBySearch('Pheno')

    cy.getDataCy('vessel-photo').should('not.exist')
    cy.getDataCy('vessel-photo-missing').contains("Ce navire n'a pas encore de photo libre de droits.")

    cy.clickButton('Ajouter une photo du navire')
    cy.contains("Qu'est-ce qu'une bonne photo de navire ?").should('be.visible')

    cy.window().then(win => {
      cy.stub(win, 'open').as('openContributeForm')
    })
    cy.clickButton('Ajouter une photo sur Open Vessel Photos')

    // The application and the contributor let MonitorFish follow the review of the photo
    cy.get('@openContributeForm').should(
      'be.calledWithMatch',
      /^https:\/\/openvesselphotos\.org\/fr\/contribute\?cfr=FAK000999999&mmsi=224103750&app=app_[a-z0-9]{12}&contributorId=[0-9a-f]{64}$/,
      '_blank'
    )
    cy.contains("Qu'est-ce qu'une bonne photo de navire ?").should('not.exist')
  })

  it('Vessel photo Should thank the user When the photo sent is received, and show it as pending', () => {
    let submissions: object[] = []
    cy.intercept('GET', OPEN_VESSEL_PHOTOS_SUBMISSIONS_URL, request => {
      request.reply({ body: submissions })
    }).as('getSubmissions')
    cy.reload()
    cy.wait('@getSubmissions')

    openVesselBySearch('Pheno')
    cy.getDataCy('vessel-photo-pending').should('not.exist')

    // The user sends the photo on Open Vessel Photos, then comes back to MonitorFish
    cy.then(() => {
      submissions = [
        {
          cfr: 'FAK000999999',
          id: 1,
          mmsi: '224103750',
          rejectReason: null,
          reviewedAt: null,
          status: 'PENDING',
          submittedAt: '2026-11-19T09:00:00Z',
          urls: null,
          vesselName: 'PHENOMENE'
        }
      ]
    })
    cy.window().then(win => win.dispatchEvent(new Event('focus')))
    cy.wait('@getSubmissions')

    cy.contains('Merci pour votre contribution ! Vous serez notifié·e dans MonitorFish').should('be.visible')
    cy.getDataCy('vessel-photo-pending').contains('elle est en attente de vérification')
    cy.getDataCy('vessel-photo-missing').find('button').should('be.disabled')
  })

  it('Vessel photo Should congratulate the user When the photo sent is approved', () => {
    cy.intercept('GET', OPEN_VESSEL_PHOTOS_SUBMISSIONS_URL, {
      body: [
        {
          cfr: 'FAK000999999',
          id: 2,
          mmsi: '224103750',
          rejectReason: null,
          reviewedAt: '2026-11-19T10:00:00Z',
          status: 'APPROVED',
          submittedAt: '2026-11-19T09:00:00Z',
          urls: { cfr: '/icone_navire_3B4559.png', mmsi: '/icone_navire_3B4559.png' },
          vesselName: 'PHENOMENE'
        }
      ]
    }).as('getSubmissions')
    cy.intercept('POST', /\/v1\/submissions\/2\/seen$/, { statusCode: 204 }).as('markSubmissionAsSeen')
    cy.reload()

    cy.getDataCy('open-vessel-photo-submission-notification').contains("Ajout d'une photo du navire Phenomene")
    cy.getDataCy('open-vessel-photo-submission-notification').contains('Félicitations !')
    cy.getDataCy('open-vessel-photo-submission-notification').contains('a été vérifiée et ajoutée à MonitorFish')

    cy.intercept('GET', OPEN_VESSEL_PHOTOS_SUBMISSIONS_URL, { body: [] })
    cy.clickButton('Fermer')

    cy.wait('@markSubmissionAsSeen').its('request.headers').should('have.property', 'x-api-key')
    cy.getDataCy('open-vessel-photo-submission-notification').should('not.exist')
  })

  it('Vessel photo Should tell the user why When the photo sent is rejected', () => {
    cy.intercept('GET', OPEN_VESSEL_PHOTOS_SUBMISSIONS_URL, {
      body: [
        {
          cfr: 'FAK000999999',
          id: 3,
          mmsi: '224103750',
          rejectReason: 'Poor quality or vessel not visible',
          reviewedAt: '2026-11-19T10:00:00Z',
          status: 'REJECTED',
          submittedAt: '2026-11-19T09:00:00Z',
          urls: null,
          vesselName: 'PHENOMENE'
        }
      ]
    })
    cy.intercept('POST', /\/v1\/submissions\/3\/seen$/, { statusCode: 204 }).as('markSubmissionAsSeen')
    cy.reload()

    cy.getDataCy('open-vessel-photo-submission-notification').contains(
      "n'a pas été acceptée : Poor quality or vessel not visible"
    )

    cy.intercept('GET', OPEN_VESSEL_PHOTOS_SUBMISSIONS_URL, { body: [] })
    cy.clickButton('Fermer')

    cy.wait('@markSubmissionAsSeen')
    cy.getDataCy('open-vessel-photo-submission-notification').should('not.exist')
  })
})
