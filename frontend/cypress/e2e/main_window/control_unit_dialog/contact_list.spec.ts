import { goToMainWindowAndOpenControlUnit } from './utils'

context('Main Window > Control Unit Dialog > Contact List', () => {
  beforeEach(() => {
    goToMainWindowAndOpenControlUnit(10484)
  })

  it('Should show all contacts by default', () => {
    cy.getDataCy('ControlUnitDialog-control-unit-contact').should('have.length', 4)
    cy.contains('Centre opérationnel').should('be.visible')
    cy.contains('Nom de contact à renseigner').should('be.visible')
  })

  it('Should validate the form', () => {
    cy.clickButton('Ajouter un contact')

    cy.clickButton('Ajouter')

    cy.contains('Veuillez choisir un nom.').should('be.visible')
    cy.contains('Veuillez entrer un téléphone ou un email.').should('be.visible')

    cy.getDataCy('ControlUnitDialog').clickButton('Annuler')

    cy.get('p').contains('Ajouter un contact').should('not.exist')
  })

  it('Should add, edit and delete a contact', () => {
    // -------------------------------------------------------------------------
    // Create

    cy.intercept('POST', `/api/v1/control_unit_contacts`).as('createControlUnitContact')

    cy.clickButton('Ajouter un contact')

    cy.fill('Nom du contact', 'Adjoint')
    cy.fill('Numéro de téléphone', '0123456789')
    cy.fill('Adresse mail', 'foo@example.org')

    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitContact').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        controlUnitId: 10484,
        email: 'foo@example.org',
        name: 'ADJUNCT',
        phone: '0123456789'
      })
    })

    cy.get('p').contains('Ajouter un contact').should('not.exist')

    // -------------------------------------------------------------------------
    // Edit

    cy.intercept('PUT', `/api/v1/control_unit_contacts/1073`).as('updateControlUnitContact')

    cy.contains('Centre opérationnel')
      .parents('[data-cy="ControlUnitDialog-control-unit-contact"]')
      .clickButton('Éditer ce contact')

    cy.fill('Nom du contact', 'Passerelle')
    cy.fill('Numéro de téléphone', '9876543210')
    cy.fill('Adresse mail', 'bar@example.org')

    cy.clickButton('Enregistrer les modifications')

    cy.wait('@updateControlUnitContact').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        controlUnitId: 10484,
        email: 'bar@example.org',
        id: 1073,
        name: 'BRIDGE',
        phone: '9876543210'
      })
    })

    cy.get('p').contains('Éditer un contact').should('not.exist')
    cy.contains('Enregistrer les modifications').should('not.exist')

    // -------------------------------------------------------------------------
    // Delete

    cy.intercept('DELETE', `/api/v1/control_unit_contacts/1073`).as('deleteControlUnitContact')

    cy.contains('Centre opérationnel')
      .parents('[data-cy="ControlUnitDialog-control-unit-contact"]')
      .clickButton('Éditer ce contact')
    cy.clickButton('Supprimer ce contact')
    cy.clickButton('Supprimer')

    cy.wait('@deleteControlUnitContact')
  })
})
