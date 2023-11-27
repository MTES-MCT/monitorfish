import { goToMainWindowAndOpenControlUnit } from './utils'

context('Main Window > Control Unit Dialog > Resource List', () => {
  beforeEach(() => {
    goToMainWindowAndOpenControlUnit(10484)
  })

  it('Should edit a control unit', () => {
    cy.intercept('PUT', `/api/v2/control_units/10484`).as('updateControlUnit')

    // -------------------------------------------------------------------------
    // Terms note

    cy.getDataCy('ControlUnitDialog-termsNote').forceClick()

    cy.fill('Modalités de contact avec l’unité', 'Des modalités de contact avec l’unité.')

    cy.clickButton('Valider')

    cy.wait('@updateControlUnit').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        administration: { id: 2, isArchived: false, name: 'Douane' },
        administrationId: 2,
        areaNote: 'Morbihan (56)',
        controlUnitContactIds: [1076, 1073, 1074, 1075],
        controlUnitResourceIds: [553],
        departmentArea: null,
        departmentAreaInseeCode: null,
        id: 10484,
        isArchived: false,
        name: 'BGC Lorient - DF 36 Kan An Avel',
        termsNote: 'Des modalités de contact avec l’unité.'
      })
    })

    cy.get('.Element-Button').contains('Valider').should('not.exist')

    // -------------------------------------------------------------------------
    // Area note

    cy.getDataCy('ControlUnitDialog-areaNote').forceClick()

    cy.fill('Secteur d’intervention', 'Un secteur d’intervention.')

    cy.clickButton('Valider')

    cy.wait('@updateControlUnit').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        administration: { id: 2, isArchived: false, name: 'Douane' },
        administrationId: 2,
        areaNote: 'Un secteur d’intervention.',
        controlUnitContactIds: [1076, 1073, 1074, 1075],
        controlUnitResourceIds: [553],
        departmentArea: null,
        departmentAreaInseeCode: null,
        id: 10484,
        isArchived: false,
        name: 'BGC Lorient - DF 36 Kan An Avel',
        termsNote: 'COD Manche Mer du Nord Atlantique'
      })
    })

    cy.get('.Element-Button').contains('Valider').should('not.exist')
  })
})
