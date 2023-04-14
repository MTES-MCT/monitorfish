import { getUtcizedDayjs } from '@mtes-mct/monitor-ui'

import { fillSideWindowMissionFormBase, openSideWindowNewMission } from './utils'
import { Mission } from '../../../../src/domain/entities/mission/types'
import { editSideWindowMissionListMissionWithId } from '../mission_list/utils'

context('Side Window > Mission Form > Main Form', () => {
  it('Should add and remove a control unit', () => {
    openSideWindowNewMission()

    cy.clickButton('Ajouter une autre unité')

    cy.get('label').contains('Administration 2').should('exist')

    cy.clickButton('Supprimer cette unité')

    cy.get('label').contains('Administration 2').should('not.exist')
  })

  it('Should send the expected data to the API when creating a new mission (required fields only)', () => {
    openSideWindowNewMission()

    const getSaveButton = () => cy.get('button').contains('Enregistrer').parent()
    const getSaveAndCloseButton = () => cy.get('button').contains('Enregistrer').parent()

    cy.intercept('PUT', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    getSaveButton().should('be.disabled')
    getSaveAndCloseButton().should('be.disabled')

    cy.fill('Types de mission', ['Mer'])

    cy.fill('Mission sous JDP', true)

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')
    cy.fill('Moyen 1', ['Semi-rigide 2'])

    cy.wait(500)

    getSaveButton().should('be.enabled')
    getSaveAndCloseButton().should('be.enabled')

    cy.clickButton('Enregistrer')

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
            isArchived: false,
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
        missionSource: 'MONITORFISH',
        missionTypes: ['SEA']
        // startDateTimeUtc: '2023-02-01T00:33:22.988Z'
      })
      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should send the expected data to the API when creating a new mission', () => {
    openSideWindowNewMission()

    cy.intercept('PUT', '/api/v1/missions', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('createMission')

    cy.fill('Types de mission', ['Air'])

    cy.fill('Administration 1', 'DDTM')
    cy.fill('Unité 1', 'Cultures marines – DDTM 40')
    cy.fill('Moyen 1', ['Semi-rigide 1'])
    cy.fill('Contact de l’unité 1', 'Bob')

    cy.clickButton('Ajouter une autre unité')

    cy.fill('Administration 2', 'DREAL')
    cy.fill('Unité 2', 'DREAL Pays-de-La-Loire')
    cy.fill('Moyen 2', ['ALTAIR', 'ARIOLA'])
    cy.fill('Contact de l’unité 2', 'Bob 2')

    // cy.fill('Lieu du contrôle', 'Free Port')

    cy.fill('CACEM : orientations, observations', 'Une note.')
    cy.fill('CNSP : orientations, observations', 'Une autre note.')
    cy.fill('Ouvert par', 'Nemo')
    cy.fill('Clôturé par', 'Doris')

    cy.wait(500)

    cy.clickButton('Enregistrer')

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
            isArchived: false,
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
            isArchived: false,
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
        missionSource: 'MONITORFISH',
        missionTypes: ['AIR'],
        observationsCacem: 'Une note.',
        observationsCnsp: 'Une autre note.',
        openBy: 'Nemo'
        // startDateTimeUtc: '2023-02-01T01:01:27.603Z'
      })
      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should send the expected data to the API when editing an existing mission', () => {
    editSideWindowMissionListMissionWithId(2)

    cy.intercept('POST', '/api/v1/missions/2', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')
    cy.intercept('PUT', '/bff/v1/mission_actions/2').as('updateMissionAction2')

    cy.clickButton('Enregistrer')

    cy.wait('@updateMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        closedBy: 'Samantha Jones',
        controlUnits: [
          {
            administration: 'Douane',
            contact: null,
            id: 10015,
            isArchived: false,
            name: 'BGC Bastia',
            resources: []
          }
        ],
        // endDateTimeUtc: '2023-01-23T02:49:25.923703Z',
        envActions: null,
        facade: 'MEMN',
        geom: null,
        id: 2,
        isClosed: false,
        isDeleted: false,
        missionSource: 'MONITORFISH',
        missionTypes: ['SEA'],
        observationsCacem:
          'Maybe own each college away likely major. Former space technology million cell. Outside body my drop require.',
        observationsCnsp: null,
        openBy: 'Brittany Graham'
        // startDateTimeUtc: '2022-01-20T04:53:35.923703Z'
      })
      assert.isString(interception.request.body.endDateTimeUtc)
      assert.isString(interception.request.body.startDateTimeUtc)
    })

    cy.wait('@updateMissionAction2').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      const nowAsDayjs = getUtcizedDayjs()

      assert.deepInclude(interception.request.body, {
        actionDatetimeUtc: `${nowAsDayjs.format('YYYY-MM-DD')}T00:00:00Z`,
        actionType: 'SEA_CONTROL',
        controlQualityComments: 'Ciblage CNSP non respecté',
        controlUnits: [],
        diversion: null,
        emitsAis: 'NOT_APPLICABLE',
        emitsVms: 'YES',
        externalReferenceNumber: null,
        facade: 'Manche ouest - Atlantique',
        feedbackSheetRequired: true,
        flagState: null,
        flightGoals: [],
        gearInfractions: [
          { comments: 'Maille trop petite', gearSeized: null, infractionType: 'WITH_RECORD', natinf: 23581 },
          { comments: 'Engin non conforme', gearSeized: null, infractionType: 'PENDING', natinf: 27724 }
        ],
        gearOnboard: [
          {
            comments: null,
            controlledMesh: null,
            declaredMesh: 60,
            gearCode: 'OTB',
            gearName: 'Chaluts de fond à panneaux',
            gearWasControlled: false
          },
          {
            comments: null,
            controlledMesh: 52.8,
            declaredMesh: 60,
            gearCode: 'OTM',
            gearName: 'Chaluts pélagiques à panneaux',
            gearWasControlled: true
          }
        ],
        id: 2,
        internalReferenceNumber: null,
        ircs: null,
        isFromPoseidon: null,
        latitude: 47.44,
        licencesAndLogbookObservations: "C'est pas très très bien réglo toute cette poissecalle non déclarée",
        licencesMatchActivity: 'NO',
        logbookInfractions: [
          {
            comments: 'Poids à bord MNZ supérieur de 50% au poids déclaré',
            infractionType: 'WITH_RECORD',
            natinf: 27689
          }
        ],
        logbookMatchesActivity: 'NO',
        longitude: -0.52,
        missionId: 2,
        numberOfVesselsFlownOver: null,
        otherComments: 'Commentaires post contrôle',
        otherInfractions: [
          {
            comments: 'Chalutage répété dans les 3 milles sur Piste VMS - confirmé de visu',
            infractionType: 'WITH_RECORD',
            natinf: 23588
          },
          { comments: "Absence d'équipement AIS à bord", infractionType: 'PENDING', natinf: 23584 }
        ],
        portLocode: null,
        portName: null,
        segments: [
          { faoAreas: ['27.8c', '27.8'], segment: 'SWW04', segmentName: 'Midwater trawls' },
          { faoAreas: ['27.3.a', '27.7', '27.8', '27.9'], segment: 'PEL03', segmentName: 'Polyvalent - Bottom trawl' }
        ],
        seizureAndDiversion: true,
        seizureAndDiversionComments: 'Saisie de la pêche',
        separateStowageOfPreservedSpecies: true,
        speciesInfractions: [
          { comments: 'Sous taille de 8cm', infractionType: 'WITHOUT_RECORD', natinf: 28346, speciesSeized: true }
        ],
        speciesObservations: "Saisie de l'ensemble des captures à bord",
        speciesOnboard: [
          { controlledWeight: 450, declaredWeight: 302.5, nbFish: null, speciesCode: 'MNZ', underSized: true },
          { controlledWeight: 40, declaredWeight: 40, nbFish: null, speciesCode: 'CRF', underSized: false }
        ],
        speciesSizeControlled: true,
        speciesWeightControlled: true,
        unitWithoutOmegaGauge: false,
        userTrigram: null,
        vesselId: 1,
        vesselName: null,
        vesselTargeted: null
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should close a new mission', () => {
    openSideWindowNewMission()
    fillSideWindowMissionFormBase(Mission.MissionTypeLabel.SEA)

    cy.fill('Clôturé par', 'Doris')

    cy.wait(500)

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@createMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // We check this prop to be sure all the data is there (this is the last field to be filled)
        closedBy: 'Doris',
        isClosed: true
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })

  it('Should close an existing mission', () => {
    editSideWindowMissionListMissionWithId(2)

    cy.intercept('POST', '/api/v1/missions/2', {
      body: {
        id: 1
      },
      statusCode: 201
    }).as('updateMission')

    // TODO Fix that in `monitor-ui`.
    cy.fill('Clôturé par', undefined)
    cy.fill('Clôturé par', 'Doris')

    cy.wait(500)

    cy.clickButton('Enregistrer et clôturer')

    cy.wait('@updateMission').then(interception => {
      if (!interception.response) {
        assert.fail('`interception.response` is undefined.')
      }

      assert.deepInclude(interception.request.body, {
        // We check this prop to be sure all the data is there (this is the last field to be filled)
        closedBy: 'Doris',
        id: 2,
        isClosed: true
      })
    })

    cy.get('h1').should('contain.text', 'Missions et contrôles')
  })
})
