import { customDayjs } from '@mtes-mct/monitor-ui'

import { addSideWindowPriorNotification, editSideWindowPriorNotification } from './utils'
import { getUtcDateInMultipleFormats } from '../../utils/getUtcDateInMultipleFormats'
import { isDateCloseTo } from '../../utils/isDateCloseTo'

context('Side Window > Prior Notification Form > Form', () => {
  it('Should add and edit a prior notification', () => {
    // -------------------------------------------------------------------------
    // Add

    const now = new Date()
    const { utcDateAsString: arrivalDateAsString, utcDateTupleWithTime: arrivalDateTupleWithTime } =
      getUtcDateInMultipleFormats(customDayjs().add(2, 'hours').startOf('minute').toISOString())
    const { utcDateAsString: landingDateAsString, utcDateTupleWithTime: landingDateTupleWithTime } =
      getUtcDateInMultipleFormats(customDayjs().add(2.5, 'hours').startOf('minute').toISOString())

    addSideWindowPriorNotification()

    cy.intercept('POST', '/bff/v1/prior_notifications').as('createPriorNotification')

    cy.getDataCy('vessel-search-input').click().wait(500)
    cy.getDataCy('vessel-search-input').type('pageot', { delay: 100 })
    cy.getDataCy('vessel-search-item').first().click()

    cy.fill("Date et heure estimées d'arrivée au port", arrivalDateTupleWithTime)
    cy.fill('Date et heure prévues de débarque', landingDateTupleWithTime)
    cy.fill("Port d'arrivée", 'Vannes')

    cy.fill('Espèces à bord et à débarquer', 'AAX')
    cy.fill('Poids (AAX)', 25)
    cy.fill('Espèces à bord et à débarquer', 'BFT')
    cy.fill('Poids (BFT)', 150)
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
    cy.fill('Zone de pêche', '21.4.T')
    cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention.")
    cy.fill('Saisi par', 'BOB')

    cy.clickButton('Créer le préavis')

    cy.wait('@createPriorNotification').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      const createdPriorNotification = createInterception.response.body

      assert.isString(createdPriorNotification.reportId)
      assert.isTrue(isDateCloseTo(createdPriorNotification.sentAt, now, 15))
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        isIncidentalCatch: false,
        quantity: null,
        specyCode: 'AAX',
        specyName: 'AAPTOSYAX GRYPUS',
        weight: 25.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        isIncidentalCatch: false,
        quantity: null,
        specyCode: 'BFT',
        specyName: 'THON ROUGE',
        weight: 150.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        isIncidentalCatch: false,
        quantity: 4.0,
        specyCode: 'BF1',
        specyName: 'THON ROUGE + 30 KG',
        weight: 40.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        isIncidentalCatch: false,
        quantity: 5.0,
        specyCode: 'BF2',
        specyName: 'THON ROUGE 8 À 30 KG',
        weight: 50.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        isIncidentalCatch: false,
        quantity: 6.0,
        specyCode: 'BF3',
        specyName: 'THON ROUGE 6.4 À 8 KG',
        weight: 60.0
      })
      assert.deepInclude(createdPriorNotification.fishingCatches, {
        isIncidentalCatch: false,
        quantity: 20.0,
        specyCode: 'SWO',
        specyName: 'ESPADON',
        weight: 200.0
      })
      assert.deepInclude(createInterception.request.body, {
        authorTrigram: 'BOB',
        didNotFishAfterZeroNotice: false,
        expectedArrivalDate: arrivalDateAsString,
        expectedLandingDate: landingDateAsString,
        faoArea: '21.4.T',
        note: "Un point d'attention.",
        portLocode: 'FRVNE',
        tripGearCodes: ['OTP', 'PTB'],
        vesselId: 119
      })

      // -----------------------------------------------------------------------
      // Edit

      editSideWindowPriorNotification('pageot')

      cy.intercept('PUT', `/bff/v1/prior_notifications/${createdPriorNotification.reportId}`).as(
        'updatePriorNotification'
      )

      cy.fill("Points d'attention identifiés par le CNSP", "Un point d'attention mis à jour.")

      cy.clickButton('Enregistrer')

      cy.wait('@updatePriorNotification').then(updateInterception => {
        if (!updateInterception.response) {
          assert.fail('`updateInterception.response` is undefined.')
        }

        assert.deepInclude(updateInterception.request.body, {
          ...createdPriorNotification,
          note: "Un point d'attention mis à jour.",
          reportId: createdPriorNotification.reportId
        })
      })
    })
  })
})
