import { faker } from '@faker-js/faker'

import { goToMainWindowAndOpenControlUnit } from './utils'

context('Main Window > Control Unit Dialog > Resource List', () => {
  beforeEach(() => {
    goToMainWindowAndOpenControlUnit(10484)
  })

  it('Should show all resources by default', () => {
    cy.getDataCy('ControlUnitDialog-control-unit-resource').should('have.length', 1)
    cy.contains('DF 36 Kan An Avel').should('be.visible')
  })

  it('Should validate the form', () => {
    cy.clickButton('Ajouter un moyen')

    cy.clickButton('Ajouter')

    cy.contains('Veuillez choisir un type.').should('be.visible')
    cy.contains('Veuillez choisir une base.').should('be.visible')

    cy.getDataCy('ControlUnitDialog').clickButton('Annuler')

    cy.get('p').contains('Ajouter un moyen').should('not.exist')
  })

  it('Should show an error dialog when trying to delete a resource linked to some missions', () => {
    cy.intercept('GET', `/api/v1/control_unit_resources/553/can_delete`, {
      body: { value: false },
      statusCode: 200
    }).as('canDeleteControlUnitResource')

    cy.contains('Vedette').parents('[data-cy="ControlUnitDialog-control-unit-resource"]').clickButton('Éditer ce moyen')
    cy.clickButton('Supprimer ce moyen')

    cy.get('.Component-Dialog').should('be.visible')
    cy.contains('Suppression impossible').should('be.visible')
  })

  it('Should add, edit and delete a resource', () => {
    goToMainWindowAndOpenControlUnit(10484)

    // -------------------------------------------------------------------------
    // Create

    cy.intercept('POST', `/api/v1/control_unit_resources`).as('createControlUnitResource')

    cy.clickButton('Ajouter un moyen')

    // On ne met pas de nom de moyen ici
    // pour tester que ce soit bien le type qui soit utilisé comme nom lorsque le nom est vide.
    const createdResourceName = 'Drône'
    cy.fill('Type de moyen', 'Drône')
    cy.fill('Base du moyen', 'Auray')
    cy.fill('Commentaire', 'Un commentaire sur le moyen.')

    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        controlUnitId: 10484,
        name: createdResourceName,
        note: 'Un commentaire sur le moyen.',
        stationId: 8,
        type: 'DRONE'
      })
    })

    cy.get('p').contains('Ajouter un moyen').should('not.exist')

    // -------------------------------------------------------------------------
    // Edit

    cy.intercept('PUT', `/api/v1/control_unit_resources/553`).as('updateControlUnitResource')

    cy.contains('Vedette').parents('[data-cy="ControlUnitDialog-control-unit-resource"]').clickButton('Éditer ce moyen')

    const editedResourceName = faker.vehicle.vehicle()
    cy.fill('Type de moyen', 'Voiture')
    cy.fill('Nom du moyen', editedResourceName)
    cy.fill('Base du moyen', 'Auray')
    cy.fill('Commentaire', 'Un autre commentaire sur le moyen.')

    cy.clickButton('Enregistrer les modifications')

    cy.wait('@updateControlUnitResource').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        controlUnitId: 10484,
        id: 553,
        name: editedResourceName,
        note: 'Un autre commentaire sur le moyen.',
        stationId: 8,
        type: 'CAR'
      })
    })

    cy.get('p').contains('Éditer un moyen').should('not.exist')
    cy.contains('Enregistrer les modifications').should('not.exist')

    // -------------------------------------------------------------------------
    // Delete

    cy.intercept('DELETE', `/api/v1/control_unit_resources/553`).as('deleteControlUnitResource')

    cy.contains('Vedette').parents('[data-cy="ControlUnitDialog-control-unit-resource"]').clickButton('Éditer ce moyen')
    cy.clickButton('Supprimer ce moyen')
    cy.clickButton('Supprimer')

    cy.wait('@deleteControlUnitResource')
  })

  it('Should archive a resource', () => {
    cy.intercept('PUT', `/api/v1/control_unit_resources/553/archive`).as('archiveControlUnitResource')

    cy.contains('Vedette').parents('[data-cy="ControlUnitDialog-control-unit-resource"]').clickButton('Éditer ce moyen')
    cy.clickButton('Archiver ce moyen')
    cy.clickButton('Archiver')

    cy.wait('@archiveControlUnitResource')
  })
})
