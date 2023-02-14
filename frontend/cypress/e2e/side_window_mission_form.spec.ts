/// <reference types="cypress" />

import { SideWindowMenuKey } from 'src/features/SideWindow/constants'

context('Mission Form', () => {
  beforeEach(() => {
    cy.visit('/side_window').wait(500)
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }
    cy.clickButton(SideWindowMenuKey.MISSION_LIST).click()
    if (document.querySelector('[data-cy="first-loader"]')) {
      cy.getDataCy('first-loader').should('not.be.visible')
    }
    cy.clickButton('Ajouter une nouvelle mission')
  })

  it('Should enable or disable under JDP checkbox depending on other field values', () => {
    const getHasMissionUnderJdpTypeCheckbox = () =>
      cy.get('label').contains('Mission sous JDP').find('input[type="checkbox"]')
    const getMissionOrderMultiRadioLegend = () => cy.get('legend').contains('Ordre de mission')

    getHasMissionUnderJdpTypeCheckbox().should('be.disabled')
    getMissionOrderMultiRadioLegend().should('not.exist')

    cy.fill('Intentions principales de mission', ['Pêche'])

    getHasMissionUnderJdpTypeCheckbox().should('be.enabled')
    getMissionOrderMultiRadioLegend().should('exist')

    cy.fill('Intentions principales de mission', ['Env', 'Autre'])

    getHasMissionUnderJdpTypeCheckbox().should('be.disabled')
    getMissionOrderMultiRadioLegend().should('not.exist')
  })

  it('Should add and remove a control unit', () => {
    cy.clickButton('Ajouter une autre unité')

    cy.get('label').contains('Administration 2').should('exist')

    cy.clickButton('Supprimer cette unité', { index: 1 })

    cy.get('label').contains('Administration 2').should('not.exist')
  })

  it('Should send the expected data to the API (required fields only)', () => {
    const getSaveButton = () => cy.get('button').contains('Enregistrer')
    const getSaveAndCloseButton = () => cy.get('button').contains('Enregistrer et clôturer')

    cy.intercept('PUT', '/api/v1/missions').as('createMission')

    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

    cy.fill('Type de mission', 'Mer')

    cy.fill('Intentions principales de mission', ['Pêche'])
    cy.fill('Mission sous JDP', true)

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')
    cy.fill('Ressource 1', ['Semi-rigide 2'])

    getSaveButton().should('be.enabled')
    getSaveAndCloseButton().should('be.enabled')

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        controlUnits: [
          {
            administration: 'DDTM',
            contact: null,
            id: 10001,
            name: 'Cultures marines – DDTM 40',
            resources: [
              {
                id: 2,
                name: 'Semi-rigide 2'
              }
            ]
          }
        ],
        // endDateTimeUtc: '2023-02-01T01:33:22.988Z',
        envActions: null,
        isClosed: false,
        isDeleted: false,
        // isUnderJdp: false,
        missionNature: ['FISH'],
        missionSource: 'MONITORFISH',
        missionType: 'SEA'
        // startDateTimeUtc: '2023-02-01T00:33:22.988Z'
      })
      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })

  it('Should send the expected data to the API', () => {
    cy.intercept('PUT', '/api/v1/missions').as('createMission')

    cy.fill('Type de mission', 'Mer')

    cy.fill('Intentions principales de mission', ['Pêche'])
    // cy.fill('Mission sous JDP', true)

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')
    cy.fill('Ressource 1', ['Semi-rigide 1'])
    cy.fill('Contact de l’unité 1', 'Bob')

    cy.clickButton('Ajouter une autre unité')

    cy.fill('Administration 2', 'DREAL')
    cy.fill('Unité 2', 'DREAL Pays-de-La-Loire')
    cy.fill('Ressource 2', ['ALTAIR', 'ARIOLA'])
    cy.fill('Contact de l’unité 2', 'Bob 2')

    cy.fill('CACEM : orientations, observations', 'Une note.')
    cy.fill('CNSP : orientations, observations', 'Une autre note.')
    cy.fill('Ouvert par', 'Nemo')
    cy.fill('Clôturé par', 'Doris')

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        closedBy: 'Doris',
        controlUnits: [
          {
            administration: 'DDTM',
            contact: 'Bob',
            id: 10001,
            name: 'Cultures marines – DDTM 40',
            resources: [
              {
                id: 1,
                name: 'Semi-rigide 1'
              }
            ]
          },
          {
            administration: 'DREAL',
            contact: 'Bob 2',
            id: 10019,
            name: 'DREAL Pays-de-La-Loire',
            resources: [
              {
                id: 10,
                name: 'ALTAIR'
              },
              {
                id: 12,
                name: 'ARIOLA'
              }
            ]
          }
        ],
        // endDateTimeUtc: '2023-02-01T02:01:27.603Z',
        isClosed: false,
        isDeleted: false,
        // isUnderJdp: true,
        missionNature: ['FISH'],
        missionSource: 'MONITORFISH',
        missionType: 'SEA',
        observationsCacem: 'Une note.',
        observationsCnsp: 'Une autre note.',
        openBy: 'Nemo'
        // startDateTimeUtc: '2023-02-01T01:01:27.603Z'
      })
      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)

      cy.get('h1').should('contain.text', 'Missions et contrôles')
    })
  })
})
