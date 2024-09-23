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

  /**
   * See: update-control-unit-contact-scenario.json for stub scenario
   */
  it('Should add, edit and delete a contact', () => {
    // -------------------------------------------------------------------------
    // Create

    cy.intercept('POST', `/api/v2/control_unit_contacts`).as('createControlUnitContact')

    cy.clickButton('Ajouter un contact')

    cy.fill('Nom du contact', 'Adjoint')
    cy.fill('Numéro de téléphone', '0123456789')
    cy.clickButton('Ajouter ce numéro à la liste de diffusion des préavis et des bilans d’activités de contrôle')
    cy.fill('Adresse mail', 'foo@example.org')
    cy.clickButton('Ajouter cette adresse à la liste de diffusion des préavis et des bilans d’activités de contrôle')

    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitContact').then(createInterception => {
      if (!createInterception.response) {
        assert.fail('`createInterception.response` is undefined.')
      }

      assert.deepInclude(createInterception.request.body, {
        controlUnitId: 10484,
        email: 'foo@example.org',
        isEmailSubscriptionContact: true,
        isSmsSubscriptionContact: true,
        name: 'ADJUNCT',
        phone: '0123456789'
      })

      const newControlUnitContactId = createInterception.response.body.id
      cy.get('p').contains('Ajouter un contact').should('not.exist')
      cy.contains('Adjoint').should('be.visible')

      // -------------------------------------------------------------------------
      // Edit

      cy.intercept('PATCH', `/api/v1/control_unit_contacts/${newControlUnitContactId}`).as('patchControlUnitContact')

      cy.get('[data-cy="ControlUnitDialog-control-unit-contact"]')
        .filter(`[data-id="${newControlUnitContactId}"]`)
        .clickButton('Éditer ce contact')

      cy.fill('Nom du contact', 'Passerelle')
      cy.fill('Numéro de téléphone', '9876543210')
      cy.fill('Adresse mail', 'bar@example.org')

      cy.clickButton('Enregistrer les modifications')

      cy.wait('@patchControlUnitContact').then(interception => {
        if (!interception.response) {
          assert.fail('`interception.response` is undefined.')
        }

        assert.deepInclude(interception.request.body, {
          email: 'bar@example.org',
          id: newControlUnitContactId,
          isEmailSubscriptionContact: true,
          isSmsSubscriptionContact: true,
          name: 'BRIDGE',
          phone: '9876543210'
        })
      })

      cy.get('p').contains('Éditer un contact').should('not.exist')
      cy.contains('Enregistrer les modifications').should('not.exist')
      cy.contains('Passerelle').should('be.visible')

      // -------------------------------------------------------------------------
      // Delete

      cy.intercept('DELETE', `/api/v1/control_unit_contacts/${newControlUnitContactId}`).as('deleteControlUnitContact')

      cy.get('[data-cy="ControlUnitDialog-control-unit-contact"]')
        .filter(`[data-id="${newControlUnitContactId}"]`)
        .clickButton('Éditer ce contact')
      cy.clickButton('Supprimer ce contact')
      cy.clickButton('Supprimer')

      // Warning banner
      cy.get('.Component-Banner')
        .should('be.visible')
        .contains(
          'Cette unité n’a actuellement plus d’adresse de diffusion. Elle ne recevra plus de préavis ni de bilan de ses activités de contrôle.'
        )

      cy.wait('@deleteControlUnitContact')

      cy.contains('Passerelle').should('not.exist')
    })
  })

  /**
   * See: subscribe-control-unit-email-scenario.json for stub scenario
   */
  it('Should subscribe and unsubscribe contact to emails and sms', () => {
    cy.contains('Enregistrer les modifications').should('not.exist')
    cy.contains('Centre opérationnel').should('be.visible')

    // -------------------------------------------------------------------------
    cy.intercept('POST', `/api/v2/control_unit_contacts`).as('createControlUnitContact')
    // Delete

    cy.clickButton('Ajouter un contact')
    cy.fill('Nom du contact', 'Adjoint')
    cy.fill('Numéro de téléphone', '0111111111')
    cy.fill('Adresse mail', 'first.contact@example.org')
    cy.clickButton('Ajouter')

    cy.wait('@createControlUnitContact').then(firstCreateInterception => {
      if (!firstCreateInterception.response) {
        assert.fail('`firstCreateInterception.response` is undefined.')
      }

      const firstControlUnitContactId = firstCreateInterception.response.body.id

      cy.clickButton('Ajouter un contact')
      cy.fill('Nom du contact', 'Adjoint')
      cy.fill('Numéro de téléphone', '0222222222')
      cy.fill('Adresse mail', 'second.contact@example.org')
      cy.clickButton('Ajouter')

      cy.wait('@createControlUnitContact').then(secondCreateInterception => {
        if (!secondCreateInterception.response) {
          assert.fail('`firstCreateInterception.response` is undefined.')
        }

        const secondControlUnitContactId = secondCreateInterception.response.body.id

        cy.intercept('PATCH', `/api/v1/control_unit_contacts/${firstControlUnitContactId}`).as(
          'patchFirstControlUnitContact'
        )
        cy.intercept('PATCH', `/api/v1/control_unit_contacts/${secondControlUnitContactId}`).as(
          'patchSecondControlUnitContact'
        )

        // Edit first contact
        cy.getDataCy('ControlUnitDialog-control-unit-contact')
          .filter(`[data-id="${firstControlUnitContactId}"]`)
          .clickButton('Éditer ce contact')

        // -------------------------------------------------------------------------
        // Subscribe phone (first contact)

        cy.clickButton('Ajouter ce numéro à la liste de diffusion des préavis et des bilans d’activités de contrôle')

        // -------------------------------------------------------------------------
        // Subscribe email (first contact)

        cy.clickButton(
          'Ajouter cette adresse à la liste de diffusion des préavis et des bilans d’activités de contrôle'
        )

        // Info message
        cy.getDataCy('ControlUnitDialog-control-unit-contact-form')
          .find('.Component-Message>')
          .should('be.visible')
          .contains('Adresse de diffusion')

        // Update first contact
        cy.clickButton('Enregistrer les modifications')

        cy.wait('@patchFirstControlUnitContact').then(patchInterception => {
          if (!patchInterception.response) {
            assert.fail('`interception.response` is undefined.')
          }

          assert.deepInclude(patchInterception.request.body, {
            email: 'first.contact@example.org',
            id: firstControlUnitContactId,
            isEmailSubscriptionContact: true,
            isSmsSubscriptionContact: true,
            phone: '0111111111'
          })
        })

        // Edit second contact
        cy.getDataCy('ControlUnitDialog-control-unit-contact')
          .filter(`[data-id="${secondControlUnitContactId}"]`)
          .clickButton('Éditer ce contact')

        // -------------------------------------------------------------------------
        // Subscribe phone (second contact)

        cy.clickButton('Ajouter ce numéro à la liste de diffusion des préavis et des bilans d’activités de contrôle')

        // -------------------------------------------------------------------------
        // Subscribe another contact to email (second contact)

        cy.clickButton(
          'Ajouter cette adresse à la liste de diffusion des préavis et des bilans d’activités de contrôle'
        )

        // Warning confirmation message
        cy.getDataCy('ControlUnitDialog-control-unit-contact-form')
          .find('.Component-Message>')
          .should('be.visible')
          .contains('Attention')
          .parent()
          .contains('first.contact@example.org')
          .parent()
          .contains('second.contact@example.org')

        cy.clickButton('Oui, la remplacer')

        // Info message
        cy.getDataCy('ControlUnitDialog-control-unit-contact-form')
          .find('.Component-Message>')
          .should('be.visible')
          .contains('Adresse de diffusion')

        // Update second contact
        cy.clickButton('Enregistrer les modifications')

        cy.wait('@patchSecondControlUnitContact').then(patchInterception => {
          if (!patchInterception.response) {
            assert.fail('`interception.response` is undefined.')
          }

          assert.deepInclude(patchInterception.request.body, {
            email: 'second.contact@example.org',
            id: secondControlUnitContactId,
            isEmailSubscriptionContact: true,
            isSmsSubscriptionContact: true,
            phone: '0222222222'
          })
        })

        // Edit second contact
        cy.getDataCy('ControlUnitDialog-control-unit-contact')
          .filter(`[data-id="${secondControlUnitContactId}"]`)
          .clickButton('Éditer ce contact')

        // -------------------------------------------------------------------------
        // Unsubscribe phone (second contact)

        cy.clickButton('Retirer ce numéro de la liste de diffusion des préavis et des bilans d’activités de contrôle')

        // -------------------------------------------------------------------------
        // Unsubscribe email (second contact)

        cy.clickButton(
          'Retirer cette adresse de la liste de diffusion des préavis et des bilans d’activités de contrôle'
        )

        // Update second contact
        cy.clickButton('Enregistrer les modifications')

        // Warning banner
        cy.get('.Component-Banner')
          .should('be.visible')
          .contains(
            'Cette unité n’a actuellement plus d’adresse de diffusion. Elle ne recevra plus de préavis ni de bilan de ses activités de contrôle.'
          )

        cy.wait('@patchSecondControlUnitContact').then(interception => {
          if (!interception.response) {
            assert.fail('`interception.response` is undefined.')
          }

          assert.deepInclude(interception.request.body, {
            email: 'second.contact@example.org',
            id: secondControlUnitContactId,
            isEmailSubscriptionContact: false,
            isSmsSubscriptionContact: false,
            phone: '0222222222'
          })
        })

        // -------------------------------------------------------------------------
        // Delete (reset)

        cy.intercept('DELETE', `/api/v1/control_unit_contacts/${firstControlUnitContactId}`).as(
          'deleteFirstControlUnitContact'
        )

        cy.getDataCy('ControlUnitDialog-control-unit-contact')
          .filter(`[data-id="${firstControlUnitContactId}"]`)
          .clickButton('Éditer ce contact')
        cy.clickButton('Supprimer ce contact')
        cy.clickButton('Supprimer')

        cy.wait('@deleteFirstControlUnitContact')

        cy.intercept('DELETE', `/api/v1/control_unit_contacts/${secondControlUnitContactId}`).as(
          'deleteSecondControlUnitContact'
        )

        cy.getDataCy('ControlUnitDialog-control-unit-contact')
          .filter(`[data-id="${secondControlUnitContactId}"]`)
          .clickButton('Éditer ce contact')
        cy.clickButton('Supprimer ce contact')
        cy.clickButton('Supprimer')

        cy.wait('@deleteSecondControlUnitContact')
      })
    })
  })
})
