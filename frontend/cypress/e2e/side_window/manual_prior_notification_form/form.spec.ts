import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { omit } from 'lodash'

import { addManualSideWindowPriorNotification } from './utils'
import { customDayjs } from '../../utils/customDayjs'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'
import { isDateCloseTo } from '../../utils/isDateCloseTo'
import { editSideWindowPriorNotification } from '../logbook_prior_notification_form/utils'
import { openSideWindowPriorNotificationListAsSuperUser } from '../prior_notification_list/utils'

context('Side Window > Manual Prior Notification Form > Form', () => {
  it('Should add and edit a manual prior notification', () => {
    // -------------------------------------------------------------------------
    // Add

    const now = new Date()
    const { utcDateAsStringWithoutMs: arrivalDateAsString, utcDateTupleWithTime: arrivalDateTupleWithTime } =
      getUtcDateInMultipleFormats(customDayjs().add(2, 'hours').startOf('minute').toISOString())
    const { utcDateAsStringWithoutMs: landingDateAsString, utcDateTupleWithTime: landingDateTupleWithTime } =
      getUtcDateInMultipleFormats(customDayjs().add(2.5, 'hours').startOf('minute').toISOString())

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('PAGEOT JO', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill('Date et heure prévues de débarque (UTC)', landingDateTupleWithTime)
    cy.fill("Port d'arrivée", 'Vannes')
    cy.fill('Zone globale de capture', '21.4.T')

    cy.fill('Espèces à bord et à débarquer', 'AAX')
    cy.fill('Poids (AAX)', 25)
    cy.fill('Espèces à bord et à débarquer', 'BFT')
    cy.fill('Quantité (BF1)', 4)
    cy.fill('Poids (BF1)', 40)
    cy.fill('Quantité (BF2)', 5)
    cy.fill('Poids (BF2)', 50)
    cy.fill('Quantité (BF3)', 6)
    cy.fill('Poids (BF3)', 60)
    cy.fill('Espèces à bord et à débarquer', 'SWO')
    cy.fill('Poids (SWO)', 200)
    cy.fill('Quantité (SWO)', 20)

    cy.fill('Engins utilisés', ['OTP', 'PTB'], { index: 1 })
    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification = createInterception.response.body

      assert.isString(createdPriorNotification.reportId)
      assert.isTrue(isDateCloseTo(createdPriorNotification.sentAt, now, 15))
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: null,
        specyCode: 'AAX',
        specyName: 'AAPTOSYAX GRYPUS',
        weight: 25.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: null,
        specyCode: 'BFT',
        specyName: 'THON ROUGE',
        weight: 150.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: 4.0,
        specyCode: 'BF1',
        specyName: 'THON ROUGE + 30 KG',
        weight: 40.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: 5.0,
        specyCode: 'BF2',
        specyName: 'THON ROUGE 8 À 30 KG',
        weight: 50.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: 6.0,
        specyCode: 'BF3',
        specyName: 'THON ROUGE 6.4 À 8 KG',
        weight: 60.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: 20.0,
        specyCode: 'SWO',
        specyName: 'ESPADON',
        weight: 200.0
      })
      assert.deepInclude(createdPriorNotification, {
        didNotFishAfterZeroNotice: false,
        expectedArrivalDate: arrivalDateAsString,
        expectedLandingDate: landingDateAsString,
        globalFaoArea: '21.4.T',
        note: "Un point d'attention.",
        portLocode: 'FRVNE',
        tripGearCodes: ['OTP', 'PTB'],
        vesselId: 119
      })

      // -----------------------------------------------------------------------
      // Edit

      editSideWindowPriorNotification('PAGEOT JO', createdPriorNotification.reportId)

      cy.contains('Créé il y a quelques secondes.').should('exist')
      cy.contains('Dernière mise à jour il y a quelques secondes.').should('exist')

      cy.intercept('PUT', `/bff/v1/prior_notifications/manual/${createdPriorNotification.reportId}`).as(
        'updateManualPriorNotification'
      )

      cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention mis à jour.")

      cy.clickButton('Enregistrer')

      cy.wait('@updateManualPriorNotification').then(updateInterception => {
        if (!updateInterception.response) {
          assert.fail('`updateInterception.response` is undefined.')
        }

        assert.deepInclude(updateInterception.response.body, {
          ...omit(createdPriorNotification, ['updatedAt']),
          note: "Un point d'attention mis à jour.",
          reportId: createdPriorNotification.reportId
        })
      })
    })
  })

  it('Should attach and remove a document to a manual prior notification', () => {
    cy.intercept('GET', `/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000008/uploads`).as('getUploads')
    cy.intercept(
      'POST',
      `/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000008/uploads?isManualPriorNotification=true&operationDate=*`
    ).as('uploadDocument')
    cy.intercept('DELETE', `/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000008/uploads/*`).as(
      'deleteDocument'
    )

    editSideWindowPriorNotification(`DÉVOILÉ`, '00000000-0000-4000-0000-000000000008')

    cy.wait('@getUploads')

    cy.fixture('sample.pdf').then(fileContent => {
      cy.get('input[type=file]').selectFile(
        {
          contents: Cypress.Buffer.from(fileContent),
          fileName: 'sample.pdf',
          mimeType: 'application/pdf'
        },
        {
          action: 'select',
          force: true
        }
      )

      cy.wait('@uploadDocument').then(() => {
        cy.wait('@getUploads').wait(500)

        cy.contains('.rs-uploader-file-item', 'sample.pdf')
          .find('.rs-uploader-file-item-btn-remove .rs-icon')
          .forceClick()

        cy.wait('@deleteDocument')
        cy.wait('@getUploads').wait(500)

        cy.contains('sample.pdf').should('not.exist')
      })
    })
  })

  it('Should display the expected manual prior notification form validation errors', () => {
    // -------------------------------------------------------------------------
    // Base form validation errors

    const { utcDateTupleWithTime } = getUtcDateInMultipleFormats(customDayjs().toISOString())

    addManualSideWindowPriorNotification()

    cy.fill('Date et heure de réception du préavis (UTC)', undefined)

    cy.clickButton('Créer le préavis')

    cy.contains('Veuillez indiquer le navire concerné.').should('exist')
    cy.contains('Veuillez indiquer la date de réception du préavis.').should('exist')
    cy.contains("Veuillez indiquer la date d'arrivée estimée.").should('exist')
    cy.contains('Veuillez indiquer la date de débarquement prévue.').should('exist')
    cy.contains("Veuillez indiquer le port d'arrivée.").should('exist')
    cy.contains('Veuillez sélectionner au moins une espèce.').should('exist')
    cy.contains('Veuillez sélectionner au moins un engin.').should('exist')
    cy.contains('Veuillez indiquer la zone FAO.').should('exist')
    cy.contains('Créer le préavis').should('be.disabled')

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('pageot', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.contains('Veuillez indiquer le navire concerné.').should('not.exist')

    cy.fill('Date et heure de réception du préavis (UTC)', utcDateTupleWithTime)

    cy.contains('Veuillez indiquer la date de réception du préavis.').should('not.exist')

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", utcDateTupleWithTime)

    cy.contains("Veuillez indiquer la date d'arrivée estimée.").should('not.exist')

    cy.fill('Date et heure prévues de débarque (UTC)', utcDateTupleWithTime)

    cy.contains('Veuillez indiquer la date de débarquement prévue.').should('not.exist')

    cy.fill("Port d'arrivée", 'Vannes')

    cy.contains("Veuillez indiquer le port d'arrivée.").should('not.exist')

    cy.fill('Zone globale de capture', '21.4.T')

    cy.contains('Veuillez indiquer la zone FAO.').should('not.exist')

    cy.fill('Espèces à bord et à débarquer', 'AAX')

    cy.contains('Veuillez sélectionner au moins une espèce.').should('not.exist')

    cy.fill('Engins utilisés', ['OTP'], { index: 1 })

    cy.contains('Veuillez sélectionner au moins un engin.').should('not.exist')

    cy.contains('Créer le préavis').should('be.enabled')

    // -------------------------------------------------------------------------
    // Date form validation errors

    cy.fill('Date et heure prévues de débarque (UTC)', undefined)

    cy.contains('Veuillez indiquer la date de débarquement prévue.').should('exist')
    cy.contains('Créer le préavis').should('be.disabled')

    cy.fill("équivalentes à celles de l'arrivée au port", true)

    cy.contains('Veuillez indiquer la date de débarquement prévue.').should('not.exist')
    cy.contains('Créer le préavis').should('be.enabled')

    // -------------------------------------------------------------------------
    // Date species & FAO area form validation errors

    cy.fill('Poids (AAX)', undefined)

    cy.contains('Veuillez indiquer le poids pour chaque espèce.').should('exist')
    cy.contains('Créer le préavis').should('be.disabled')

    cy.fill('Poids (AAX)', 10)

    cy.contains('Veuillez indiquer le poids pour chaque espèce.').should('not.exist')

    cy.fill('Zones de capture', 'Différentes zones de capture')

    cy.contains('Veuillez indiquer la zone FAO pour chaque espèce.').should('exist')

    cy.fill('Zone de capture (AAX)', '21.4.T')

    cy.contains('Veuillez indiquer la zone FAO pour chaque espèce.').should('not.exist')
    cy.contains('Créer le préavis').should('be.enabled')
  })

  it('Should calculate and display manual prior notification fleet segments, risk factor & types', () => {
    // -------------------------------------------------------------------------
    // Add

    const now = new Date()
    const { utcDateAsStringWithoutMs: arrivalDateAsString, utcDateTupleWithTime: arrivalDateTupleWithTime } =
      getUtcDateInMultipleFormats(customDayjs().add(2, 'hours').startOf('minute').toISOString())

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')
    cy.intercept('POST', '/bff/v1/prior_notifications/manual/compute').as('computePriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('IN-ARÊTE-ABLE', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill("équivalentes à celles de l'arrivée au port", true)
    cy.fill("Port d'arrivée", 'Vannes')
    cy.fill('Zone globale de capture', '27.7.d')

    cy.fill('Espèces à bord et à débarquer', 'MORUE COMMUNE')
    cy.fill('Poids (COD)', 5000)

    cy.fill('Engins utilisés', ['OTB'], { index: 1 })

    cy.wait('@computePriorNotification')
    cy.getDataCy('VesselRiskFactor').contains('1.9').should('exist')
    cy.get('.Element-Tag').contains('NWW01/02 – Trawl').should('exist')
    cy.get('.Element-Tag').contains('Préavis type 1').should('exist')
    cy.get('.Element-Tag').contains('Préavis type 2').should('exist')

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification = createInterception.response.body

      assert.isString(createdPriorNotification.reportId)
      assert.isTrue(isDateCloseTo(createdPriorNotification.sentAt, now, 15))
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: null,
        specyCode: 'COD',
        specyName: 'MORUE COMMUNE (CABILLAUD)',
        weight: 5000.0
      })
      assert.deepInclude(createdPriorNotification, {
        didNotFishAfterZeroNotice: false,
        expectedArrivalDate: arrivalDateAsString,
        // Should be the same as the arrival date since we checked "équivalentes à celles de l'arrivée au port"
        expectedLandingDate: arrivalDateAsString,
        globalFaoArea: '27.7.d',
        note: null,
        portLocode: 'FRVNE',
        tripGearCodes: ['OTB'],
        vesselId: 113
      })

      // -----------------------------------------------------------------------
      // List

      openSideWindowPriorNotificationListAsSuperUser()
      cy.fill('Rechercher un navire', 'IN-ARÊTE-ABLE')

      // TODO Check if we need to update the vessel risk factor in DB while saving a prior notification.
      // cy.getTableRowById(createdPriorNotification.reportId).getDataCy('VesselRiskFactor').contains('2')
      cy.getTableRowById(createdPriorNotification.reportId).contains('NWW01/02')
      cy.getTableRowById(createdPriorNotification.reportId).contains('Préavis type 1')
      cy.getTableRowById(createdPriorNotification.reportId).contains('Préavis type 2')

      // -----------------------------------------------------------------------
      // Edit

      editSideWindowPriorNotification('IN-ARÊTE-ABLE', createdPriorNotification.reportId)

      cy.intercept('PUT', `/bff/v1/prior_notifications/manual/${createdPriorNotification.reportId}`).as(
        'updateManualPriorNotification'
      )

      cy.fill('Engins utilisés', ['OTB', 'Chaluts de fond (non spécifiés)' /* (TB) */], { index: 1 })
      cy.fill('Zone globale de capture', '27.5.b')

      cy.wait('@computePriorNotification')
      cy.getDataCy('VesselRiskFactor').contains('1.9').should('exist')
      cy.get('.Element-Tag').contains('NWW01/02 – Trawl').should('exist')
      cy.get('.Element-Tag').contains('NWW03 – Deep water trawl ≥100 mm').should('exist')
      cy.get('.Element-Tag').contains('Préavis type 1').should('not.exist')
      cy.get('.Element-Tag').contains('Préavis type 2').should('not.exist')

      cy.clickButton('Enregistrer')

      cy.wait('@updateManualPriorNotification').then(updateInterception => {
        if (!updateInterception.response) {
          assert.fail('`updateInterception.response` is undefined.')
        }

        const updatedPriorNotification = updateInterception.response.body

        assert.includeMembers(updatedPriorNotification.tripGearCodes, ['OTB', 'TB'])
        assert.deepInclude(updatedPriorNotification, {
          ...omit(createdPriorNotification, ['tripGearCodes', 'updatedAt']),
          globalFaoArea: '27.5.b',
          reportId: createdPriorNotification.reportId
        })

        cy.get('.Element-Button').contains('Télécharger').parent().should('be.disabled')

        // -----------------------------------------------------------------------
        // List

        openSideWindowPriorNotificationListAsSuperUser()
        cy.fill('Rechercher un navire', 'IN-ARÊTE-ABLE')

        cy.getTableRowById(createdPriorNotification.reportId).contains('NWW01/02')
        cy.getTableRowById(createdPriorNotification.reportId).contains('NWW03')
        cy.getTableRowById(createdPriorNotification.reportId).contains('Aucun type')
      })
    })
  })

  it('Should only recalculate manual prior notification fleet segments, risk factor & types when necessary (creation)', () => {
    cy.intercept('POST', '/bff/v1/prior_notifications/manual/compute').as('computePriorNotification')
    cy.resetCountRequestsByAlias('@computePriorNotification')

    addManualSideWindowPriorNotification()

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').clear().type('IN-ARÊTE-ABLE', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.fill("Port d'arrivée", 'Marseille')

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.fill('Zone globale de capture', '27.7.d')

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.fill('Espèces à bord et à débarquer', 'AAX')

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.fill('Poids (AAX)', 50)

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.fill('Engins utilisés', ['OTB'], { index: 1 })

    cy.wait('@computePriorNotification')
    cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 1)

    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 1)
  })

  it('Should only recalculate manual prior notification fleet segments, risk factor & types when necessary (edition)', () => {
    cy.intercept('POST', '/bff/v1/prior_notifications/manual/compute').as('computePriorNotification')
    cy.resetCountRequestsByAlias('@computePriorNotification')

    editSideWindowPriorNotification('POISSON PAS NET', '00000000-0000-4000-0000-000000000001')

    // cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 0)

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').clear().type('IN-ARÊTE-ABLE', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.wait('@computePriorNotification')
    cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 1)

    cy.fill("Port d'arrivée", 'Marseille')

    cy.wait('@computePriorNotification')
    cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 2)

    cy.fill('Zone globale de capture', '27.7.d')

    cy.wait('@computePriorNotification')
    cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 3)

    cy.fill('Poids (SOS)', 50)

    cy.wait('@computePriorNotification')
    cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 4)

    cy.fill('Espèces à bord et à débarquer', 'AAX')

    cy.wait('@computePriorNotification')
    cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 5)

    cy.fill('Engins utilisés', ['OTB'], { index: 1 })

    cy.wait('@computePriorNotification')
    // cy.countRequestsByAlias('@computePriorNotification').should('be.equal', 6)

    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")

    cy.countRequestsByAlias('@computePriorNotification', 1500).should('be.equal', 6)
  })

  it('Should switch from global FAO area to per species FAO area and vice versa in a manual prior notification', () => {
    // -------------------------------------------------------------------------
    // Add

    const now = new Date()
    const { utcDateAsStringWithoutMs: arrivalDateAsString, utcDateTupleWithTime: arrivalDateTupleWithTime } =
      getUtcDateInMultipleFormats(customDayjs().add(2, 'hours').startOf('minute').toISOString())

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('SABORDS', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill("équivalentes à celles de l'arrivée au port", true)
    cy.fill("Port d'arrivée", 'Marseille')
    cy.fill('Zone globale de capture', '27.5.a')

    cy.fill('Espèces à bord et à débarquer', 'AAX')
    cy.fill('Poids (AAX)', 25)
    cy.fill('Espèces à bord et à débarquer', 'POH')
    cy.fill('Poids (POH)', 50)

    cy.fill('Engins utilisés', ['OTP'], { index: 1 })

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification = createInterception.response.body

      assert.isString(createdPriorNotification.reportId)
      assert.isTrue(isDateCloseTo(createdPriorNotification.sentAt, now, 15))
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: null,
        specyCode: 'AAX',
        specyName: 'AAPTOSYAX GRYPUS',
        weight: 25.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        faoArea: null,
        quantity: null,
        specyCode: 'POH',
        specyName: 'ROUSSETTE PANTHERE',
        weight: 50.0
      })
      assert.deepInclude(createdPriorNotification, {
        didNotFishAfterZeroNotice: false,
        expectedArrivalDate: arrivalDateAsString,
        expectedLandingDate: arrivalDateAsString, // Checked "équivalentes à celles de l'arrivée au port"
        globalFaoArea: '27.5.a',
        note: null,
        portLocode: 'FRMRS',
        tripGearCodes: ['OTP'],
        vesselId: 127
      })

      // -----------------------------------------------------------------------
      // Edit (1st time)

      cy.intercept('PUT', `/bff/v1/prior_notifications/manual/${createdPriorNotification.reportId}`).as(
        'updateManualPriorNotification'
      )

      cy.fill('Zones de capture', 'Différentes zones de capture')
      cy.fill('Zone de capture (AAX)', '27.5.a.1')
      cy.fill('Zone de capture (POH)', '27.5.a.2')

      cy.clickButton('Enregistrer')

      cy.wait('@updateManualPriorNotification').then(firstUpdateInterception => {
        if (!firstUpdateInterception.response) {
          assert.fail('`updateInterception.response` is undefined.')
        }

        const firstUpdatedPriorNotification = firstUpdateInterception.response.body

        assert.deepInclude(firstUpdatedPriorNotification.fishingCatches, {
          faoArea: '27.5.a.1',
          quantity: null,
          specyCode: 'AAX',
          specyName: 'AAPTOSYAX GRYPUS',
          weight: 25.0
        })
        assert.deepInclude(firstUpdatedPriorNotification.fishingCatches, {
          faoArea: '27.5.a.2',
          quantity: null,
          specyCode: 'POH',
          specyName: 'ROUSSETTE PANTHERE',
          weight: 50.0
        })
        assert.deepInclude(firstUpdatedPriorNotification, {
          didNotFishAfterZeroNotice: false,
          expectedArrivalDate: arrivalDateAsString,
          expectedLandingDate: arrivalDateAsString, // Checked "équivalentes à celles de l'arrivée au port"
          globalFaoArea: null,
          note: null,
          portLocode: 'FRMRS',
          tripGearCodes: ['OTP'],
          vesselId: 127
        })

        // -----------------------------------------------------------------------
        // Edit (2nd time)

        cy.fill('Zones de capture', 'Une seule zone de capture')
        cy.fill('Zone globale de capture', '27.5.b')

        cy.clickButton('Enregistrer')

        cy.wait('@updateManualPriorNotification').then(secondUpdateInterception => {
          if (!secondUpdateInterception.response) {
            assert.fail('`updateInterception.response` is undefined.')
          }

          const secondUpdatedPriorNotification = secondUpdateInterception.response.body

          assert.deepInclude(secondUpdatedPriorNotification.fishingCatches, {
            faoArea: null,
            quantity: null,
            specyCode: 'AAX',
            specyName: 'AAPTOSYAX GRYPUS',
            weight: 25.0
          })
          assert.deepInclude(secondUpdatedPriorNotification.fishingCatches, {
            faoArea: null,
            quantity: null,
            specyCode: 'POH',
            specyName: 'ROUSSETTE PANTHERE',
            weight: 50.0
          })
          assert.deepInclude(secondUpdatedPriorNotification, {
            didNotFishAfterZeroNotice: false,
            expectedArrivalDate: arrivalDateAsString,
            expectedLandingDate: arrivalDateAsString, // Checked "équivalentes à celles de l'arrivée au port"
            globalFaoArea: '27.5.b',
            note: null,
            portLocode: 'FRMRS',
            tripGearCodes: ['OTP'],
            vesselId: 127
          })
        })
      })
    })
  })

  it('Should be able to resend & verify a previously sent & verified manual prior notification', () => {
    // Given
    cy.intercept(
      'POST',
      '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000010/verify_and_send?isManuallyCreated=true&operationDate=*'
    ).as('verifyAndSendPriorNotification')
    editSideWindowPriorNotification('BEAU SÉANT', '00000000-0000-4000-0000-000000000010')

    cy.get('button').contains('Diffusé')

    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention mis à jour.")

    // When
    cy.clickButton('Enregistrer')
    cy.clickButton('Diffuser')

    // Then
    cy.wait('@verifyAndSendPriorNotification')
  })

  it('Should verify and send a manual prior notification', () => {
    // -------------------------------------------------------------------------
    // Add

    const { utcDateTupleWithTime: arrivalDateTupleWithTime } = getUtcDateInMultipleFormats(
      customDayjs().add(2, 'hours').startOf('minute').toISOString()
    )

    cy.intercept('POST', '/bff/v1/prior_notifications/manual').as('createPriorNotification')
    cy.intercept(
      'GET',
      /\/bff\/v1\/prior_notifications\/[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\?isManuallyCreated=true&operationDate=.*/i
    ).as('getPriorNotification')

    addManualSideWindowPriorNotification()

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('IN-ARÊTE-ABLE', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port (UTC)", arrivalDateTupleWithTime)
    cy.fill("équivalentes à celles de l'arrivée au port", true)
    cy.fill("Port d'arrivée", 'Vannes')

    cy.fill('Espèces à bord et à débarquer', 'MORUE COMMUNE')
    cy.fill('Poids (COD)', 5000)

    cy.fill('Engins utilisés', ['OTB'], { index: 1 })
    cy.fill('Zone globale de capture', '27.7.d')

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification = createInterception.response.body

      // -----------------------------------------------------------------------
      // Get (created prior notification full data)

      cy.wait('@getPriorNotification').then(getInterception => {
        if (!getInterception.response) {
          assert.fail('`getInterception.response` is undefined.')
        }

        assert.deepInclude(getInterception.response.body, {
          state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
        })

        cy.get('.Element-Tag').contains('Hors vérification').should('exist')

        // -----------------------------------------------------------------------
        // Verify and send

        cy.intercept(
          'POST',
          `/bff/v1/prior_notifications/${createdPriorNotification.reportId}/verify_and_send?isManuallyCreated=true&operationDate=*`
        ).as('verifyAndSendPriorNotification')

        cy.clickButton('Diffuser')

        cy.wait('@verifyAndSendPriorNotification').then(verifyAndSendInterception => {
          if (!verifyAndSendInterception.response) {
            assert.fail('`verifyAndSendInterception.response` is undefined.')
          }

          const updatedPriorNotification = verifyAndSendInterception.response.body

          assert.deepInclude(updatedPriorNotification, {
            state: PriorNotification.State.PENDING_SEND
          })

          // -----------------------------------------------------------------------
          // List

          cy.clickButton('Fermer')
          cy.fill('Rechercher un navire', 'IN-ARÊTE-ABLE')

          cy.getTableRowById(createdPriorNotification.reportId)
            .find('span[title="Diffusion en cours"]')
            .should('be.visible')
        })
      })
    })
  })

  it('Should invalidate a manual prior notification', () => {
    // Given
    cy.intercept(
      'POST',
      '/bff/v1/prior_notifications/00000000-0000-4000-0000-000000000001/invalidate?isManuallyCreated=true&operationDate=*'
    ).as('verifyAndSendPriorNotification')
    editSideWindowPriorNotification('POISSON PAS NET', '00000000-0000-4000-0000-000000000001')
    cy.get('.Wrapper').should('not.contain', 'Invalidé')

    // When
    cy.clickButton('Invalider le préavis')
    cy.clickButton('Confirmer l’invalidation')
    cy.get('.Wrapper').contains('Invalidé')
    cy.get('[title="Invalider le préavis"]').should('not.exist')

    // Then
    cy.clickButton('Fermer')
    cy.getTableRowById('00000000-0000-4000-0000-000000000001').find('[title="Préavis invalidé"]').should('exist')
  })

  it('Should display manual prior notification edit history as expected', () => {
    editSideWindowPriorNotification('POISSON PAS NET', '00000000-0000-4000-0000-000000000001')

    cy.contains('Créé par BOB il y a').should('exist')
    cy.contains('Dernière mise à jour par BOB il y a').should('exist')

    editSideWindowPriorNotification('DOS FIN', '00000000-0000-4000-0000-000000000002')

    cy.contains('Créé par creator@example.org il y a').should('exist')
    cy.contains('Dernière mise à jour par editor@example.org il y a').should('exist')

    editSideWindowPriorNotification('QUEUE DE POISSON', '00000000-0000-4000-0000-000000000003')

    cy.contains('Créé par creator@example.org il y a').should('exist')
    cy.contains('Dernière mise à jour').should('not.exist')
  })
})
